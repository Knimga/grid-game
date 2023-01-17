import './gameTab.css';

import {useState, useEffect} from 'react';

import BoardComponent from './GameBoard';
import Combatants from './Combatants';
import Actions from './Actions';
import GameLog from './GameLog';
import Meters from './Meters';

import { aiPlan } from '../../services/aiPlan';
import { resolveAction, getTargetTypes, setNewRound, effectAlreadyApplied } from '../../services/actions';
import { getInRangeIndices, getAoeLineIndices, distance, getAdjacentIndices } from '../../services/ranger';
import { logger, newTurnLog } from '../../services/logger';
import { createMeters, updateMeters, resetThreat } from '../../services/meters';
import { setCharVisibility, getPlayerLos } from '../../services/los';
import { getAdjacencyMatrix, getRemainingMvt, moveTowardsDest } from '../../services/aiMove';
import { findBestBurstPlacement} from '../../services/aiAct';
import { countChars, isDead, rezDeadPlayers } from '../../services/miscGameLogic';
import { updateExploredAreas } from '../../services/boards';

import { GameBoard, GameChar, Action, ActionResult, AiPlan, Door } from '../../types/types';
import { CharType } from '../../types/enums';
import {TurnLog, RangeType, MetersEntry } from '../../types/uiTypes';

interface GameTabInput {
    startingBoard: GameBoard;
    colorScheme: {
        wall: string;
        floor: string;
    };
    enterDoor: Function;
}

export default function GameTab({startingBoard, enterDoor, colorScheme}: GameTabInput) {
    const startingLos: number[] = getPlayerLos(startingBoard);
    
    const [board, setBoard] = useState<GameBoard>(
        {...startingBoard, exploredAreas: updateExploredAreas(startingBoard.exploredAreas, startingLos)});
    const [chars, setChars] = useState<GameChar[]>(board.chars);

    let adjMatrix: number[][] = getAdjacencyMatrix(board);

    const [turnIndex, setTurnIndex] = useState<number>(0);
    const [roundNumber, setRoundNumber] = useState<number>(1);
  
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);

    const [los, setLos] = useState<number[]>(startingLos);
    const [mvtHighlight, setMvtHighlight] = useState<number[]>([]);
    const [actionHighlight, setActionHighlight] = useState<number[]>([]);
    const [aoeHighlight, setAoeHighlight] = useState<number[]>([]);

    const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
    const [roomIsClear, setRoomIsClear] = useState<boolean>(countChars(board, false) === 0);

    const [turnLog, setTurnLog] = useState<TurnLog[]>(newTurnLog(chars[0]));
    const [meters, setMeters] = useState<MetersEntry[]>(createMeters(board.chars));

    useEffect(() => {
        if(chars.length && chars[turnIndex].type !== CharType.player) aiTurn(chars[turnIndex])
    }, [turnIndex]);

    function endTurn(): void {
        let isNewRound: boolean = turnIndex === chars.length - 1;
        let newChars: GameChar[] = [...chars];
        let newTurnIndex: number = (turnIndex + 1) % chars.length;

        while(isDead(chars[newTurnIndex])) {
            newTurnIndex = (newTurnIndex + 1) % chars.length;
            if(newTurnIndex === 0) isNewRound = true;
        }

        if(isNewRound) {
            const newRoundData = setNewRound(newChars, meters);
            newChars = newRoundData.newChars;
            setMeters(newRoundData.newMeters);
            setRoundNumber(roundNumber + 1);
            turnLog.unshift(logger.newRound(roundNumber + 1));
        }   

        newChars.forEach(char => char.game.isTurn = false);
        newChars[newTurnIndex].game.isTurn = true;

        if(newChars[newTurnIndex].game.hasBeenSeen) {
            turnLog.unshift(logger.newTurn(newChars[newTurnIndex].name))
        } else if(turnLog[0].header !== 'Enemies are acting...') {
            turnLog.unshift(logger.newUnseenTurn())
        }

        setTurnIndex(newTurnIndex);
        setTurnLog(turnLog);
        setChars(newChars);
        setSelectedAction(null);
        clearHighlights();
        if(selectedDoor) setSelectedDoor(null);
    }

    async function aiTurn(char: GameChar) {
        if(char.type !== CharType.player) {
            const plan: AiPlan = aiPlan(chars, char, board, meters, adjMatrix, roundNumber);
            const sleepLength: number = char.game.isVisible ? 1000 : 500;
        
            if(plan.newDest) setCharDest(char, plan.newDest);

            await sleep(sleepLength);
            
            if(char.game.destinationIndex) await moveCycle(char);

            if(plan.chosenAction && plan.target && plan.newDest === char.game.positionIndex) {
                selectAction(plan.chosenAction);
                await sleep(sleepLength);

                if(['burst','line'].includes(plan.chosenAction.target)) {
                    let aoeTargetIndex: number = plan.target.game.positionIndex;

                    if(plan.chosenAction.hasOwnProperty('burstRadius')) {
                        aoeTargetIndex = plan.chosenAction.range === 0  ? 
                            char.game.positionIndex : findBestBurstPlacement(
                                board, plan.chosenAction, char.game.gameId, 
                                plan.target.game.positionIndex, adjMatrix
                            );
                    }
                    
                    const aoeEffectIndices: number[] = aoeRange(aoeTargetIndex, plan.chosenAction);
                    setAoeHighlight(aoeEffectIndices);
                    await sleep(sleepLength);
                    performAction(aoeEffectIndices, plan.chosenAction);
                } else {
                    setAoeHighlight([plan.target.game.positionIndex]);
                    await sleep(sleepLength);
                    performAction([plan.target.game.positionIndex], plan.chosenAction);
                }
                
                await sleep(sleepLength);
            }

            endTurn();

        } else {console.log(`${char.name} is not enemy/beast`)}
    }

    async function moveCycle(char: GameChar) {
        if(char.game.destinationIndex) {
            const destIndex: number = char.game.destinationIndex;
            const sleepLength: number = char.game.isVisible ? 1000 : 500;

            while(getRemainingMvt(char) > 0 && destIndex !== char.game.positionIndex) {

                if(char.game.isVisible) {
                    const mvtRangeIndices = getInRangeIndices(
                        board, char.game.positionIndex, getRemainingMvt(char), RangeType.mvt);
                    setMvtHighlight(mvtRangeIndices);
                }
                await sleep(sleepLength);
    
                const moveToIndex: number = moveTowardsDest(board, char, destIndex, adjMatrix);

                moveTo(moveToIndex);
                
                await sleep(sleepLength);
            }

        } else {console.log('no char.game.destinationIndex')}
    }

    function moveTo(index: number): void {
        const startingPosition: number = chars[turnIndex].game.positionIndex;
        const distanceMoved: number = distance(startingPosition, index, board.gridWidth);
        
        chars[turnIndex].game.positionIndex = index;
        chars[turnIndex].game.round.movementTaken += distanceMoved;
        board.chars = chars;

        if(chars[turnIndex].type === CharType.player || chars[turnIndex].game.isVisible) {
            turnLog[0].actions.push(logger.move(chars[turnIndex].name, distanceMoved));
        } else if(chars[turnIndex].game.hasBeenSeen) {
            turnLog[0].actions.push(logger.unseenMove(chars[turnIndex].name))
        }

        adjMatrix = getAdjacencyMatrix(board);
        setTurnLog(turnLog);
        setMvtHighlight([]);
        setChars(setCharVisibility(board));
        
        if(chars[turnIndex].type === CharType.player) {
            const playerLos: number[] = getPlayerLos(board);
            setLos(playerLos);
            board.exploredAreas = updateExploredAreas(board.exploredAreas, playerLos);
            if(selectedDoor && !charNearDoor(chars[turnIndex], selectedDoor)) setSelectedDoor(null);
        }

        setBoard(board);
    }

    function setCharDest(char: GameChar, newDest: number): void {
        const newChar: GameChar = {...char};
        newChar.game.destinationIndex = newDest;
        const oldChar: GameChar | undefined = chars.find(oldChar => oldChar.game.gameId === char.game.gameId);
        if(oldChar) {
            const oldCharIndex: number = chars.indexOf(oldChar);
            chars[oldCharIndex] = newChar;
            setChars(chars);
        }
    }

    function showMovement(): void {
        if(mvtHighlight.length) {
            setMvtHighlight([])
        } else {
            const mover: GameChar = chars[turnIndex];
            const mvtRemaining: number = getRemainingMvt(mover);        
            const mvtIndices: number[] = getInRangeIndices(
                board, mover.game.positionIndex, mvtRemaining, RangeType.mvt
            );
            if(selectedAction) setSelectedAction(null);
            if(actionHighlight.length) setActionHighlight([]);
            setMvtHighlight(mvtIndices);
        }
    }

    function selectAction(action: Action, toggleOff?: boolean): void {
        clearHighlights();
        if(toggleOff) {
            setSelectedAction(null);
            setActionHighlight([]);
        } else {
            setSelectedAction(action);
            if(chars[turnIndex].game.isVisible || chars[turnIndex].type === 'player') {
                toggleRange(action, action.intent === 'offense' ? RangeType.atk : RangeType.def)
            }
        }
    }

    function toggleRange(action: Action, rangeType: RangeType): void {
        const actor: GameChar = chars[turnIndex];
        const povIndex: number = actor.game.positionIndex;
        const indices: number[] = getInRangeIndices(board, povIndex, action.range, rangeType);
        if(mvtHighlight.length) setMvtHighlight([]);
        setActionHighlight(indices);
    }

    function aoeRange(mouseoverIndex: number, actionInput?: Action): number[] {
        const action: Action | null = actionInput ? actionInput : selectedAction;
        if(action) {
            if(action.burstRadius && action.burstRadius > 0) {
                return [mouseoverIndex, ...getInRangeIndices(board, mouseoverIndex, action.burstRadius)]
            }
            if(action.target === 'line') {
                return getAoeLineIndices(board, chars[turnIndex].game.positionIndex, mouseoverIndex)
            }
            return [mouseoverIndex]
        } else {console.log('null action!'); return []}
    }

    function performAction(affectedIndices: number[], actionInput?: Action): void {
        const actor: GameChar = chars[turnIndex];
        const action: Action | null = actionInput ? actionInput : selectedAction;

        if(action && !actor.game.round.actionTaken && actor.game.stats.mp >= action.mpCost) {
            const targetCharTypes: CharType[] = getTargetTypes(action.intent, actor.type);
            const affectedChars: GameChar[] = chars.filter(char => 
                affectedIndices.includes(char.game.positionIndex) && targetCharTypes.includes(char.type)
            ); 

            if(affectedChars.length && affectedChars.some(char => 
                !effectAlreadyApplied(char.game.activeEffects, actor.game.gameId, action.name)
            )) {
                const results: ActionResult[] = resolveAction(actor, affectedChars, action);
                let newMeters: MetersEntry[] = meters;
                
                for (let r = 0; r < results.length; r++) {
                    const thisChar: GameChar | undefined = chars.find(
                        char => char.game.gameId === results[r].newChar.game.gameId);
                    if(thisChar) {
                        const targetIndex: number = chars.indexOf(thisChar);
                        chars[targetIndex] = results[r].newChar;

                        newMeters = updateMeters(results[r], meters, actor.game.gameId, 
                            chars[targetIndex].game.gameId);
                    }
                }
                
                turnLog[0].actions = [...turnLog[0].actions, ...logger.action(actor.name, results)];
                setTurnLog(turnLog);
                if(results.some(res => res.charDiedThisTurn)) {
                    results.forEach(res => {if(res.charDiedThisTurn) charDies(res.newChar.game.gameId)})
                }

                chars[turnIndex].game.round.actionTaken = true;
                chars[turnIndex].game.stats.mp -= action.mpCost;

                setMeters(newMeters);
                clearHighlights();
                setSelectedAction(null);
                setChars(chars);
            }
        }
    }

    function charDies(charId: string | undefined): void {
        if(charId) {
            let newChars: GameChar[] = [...chars];
            const newBoard: GameBoard = {...board};
            const targetChar: GameChar | undefined = newChars.find(char => charId === char.game.gameId);
            if(targetChar) {
                const charIndex: number = newChars.indexOf(targetChar);
                newChars[charIndex].game.stats.hp = 0;
                newChars[charIndex].game.positionIndex = -1;
                newBoard.chars = newChars;
                turnLog[0].actions.push(logger.charDies(chars[turnIndex].name, targetChar.name));

                setTurnLog(turnLog);
                setMeters(resetThreat(meters, charId));
            }

            const countOfPlayers: number = countChars(newBoard, true);
            const countOfEnemies: number = countChars(newBoard, false);

            if(countOfPlayers === 0) {
                turnLog.unshift(logger.victory(CharType.enemy));
            } else if(countOfEnemies === 0) {
                turnLog.unshift(logger.victory(CharType.player));
                setRoomIsClear(true);
                newChars = rezDeadPlayers(newChars, newBoard);
                newBoard.chars = newChars;
            }

            setBoard(newBoard);
            setChars(newChars);
        }
    }

    function clearHighlights(): void {
        if(mvtHighlight.length) setMvtHighlight([]);
        if(actionHighlight.length) setActionHighlight([]);
        if(aoeHighlight.length) setAoeHighlight([]);
    }

    function charNearDoor(char: GameChar, door: Door): boolean {
        const adjIndices: number[] = getAdjacentIndices(
            char.game.positionIndex, board.gridWidth, board.gridHeight);
        return adjIndices.includes(door.position);
    }

    function clickDoor(index: number): void {
        if(roomIsClear) {
            if(selectedDoor) {
                setSelectedDoor(null)
            } else {
                const door: Door | undefined = board.doors.find(d => d.position === index);
                const adjIndices: number[] = getAdjacentIndices(
                    chars[turnIndex].game.positionIndex, board.gridWidth, board.gridHeight);
                if(door && adjIndices.includes(index)) setSelectedDoor(door);
            }  
        }
    }

    function clickEnterDoor(): void {if(selectedDoor) enterDoor(selectedDoor, board)}

    function sleep(ms: number) {return new Promise(resolve => setTimeout(resolve, ms))}

    const actionFunctions = {
        endTurn: endTurn,
        showMovement: showMovement,
        selectAction: selectAction,
        clickEnterDoor: clickEnterDoor
    }

    const boardFunctions = {
        moveTo: moveTo,
        performAction: performAction,
        aoeRange: aoeRange,
        setAoeHighlight: setAoeHighlight,
        clickDoor: clickDoor
    }

    function logChars(): void {console.log(chars)}
    function log(): void {console.log(meters)}

    return (
        <div className="tab-container">
            <div className="top-bar">
                <button onClick={() => logChars()}>Log Chars</button>
                <button onClick={() => log()}>Log</button>
                <button onClick={() => endTurn()}>End Turn</button>
            </div>
            <div className="middle">
                <div className="left-side-panel">
                    <GameLog logs={turnLog} />
                    <Meters meters={meters} />
                                 
                </div>
                {board ? 
                    <div className="board-container">
                        <BoardComponent 
                            board={board} 
                            mvtHighlight={mvtHighlight}
                            actionHighlight={actionHighlight}
                            selectedAction={selectedAction}
                            aoeHighlight={aoeHighlight}
                            los={los}
                            boardFunctions={boardFunctions}
                            colorScheme={colorScheme}
                            roomIsClear={roomIsClear}
                            selectedDoor={selectedDoor}
                        />
                    </div>
                    : ''
                }
                <div className="right-side-panel">
                    <Combatants chars={chars} roundNumber={roundNumber}/>
                    <Actions 
                        char={chars[turnIndex]} 
                        enableDoorButton={selectedDoor !== null && charNearDoor(chars[turnIndex], selectedDoor)}
                        actionFunctions={actionFunctions}
                    />
                </div>
            </div>
        </div>
    )
}