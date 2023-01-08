import './gameTab.css';

import {useState, useEffect} from 'react';

import BoardComponent from './BoardComponent';
import Combatants from './Combatants';
import Actions from './Actions';
import GameLog from './GameLog';
import CharStats from './CharStats';
import Meters from './Meters';

import { aiPlan } from '../../services/aiPlan';
import { resolveAction, getTargetTypes, setNewRound, effectAlreadyApplied } from '../../services/actions';
import { getInRangeIndices, getAoeLineIndices, distance } from '../../services/ranger';
import { logger, newTurnLog } from '../../services/logger';
import { createMeters, dmgDoneAndTaken, healingDone, statEffectsDone, resetThreat } from '../../services/meters';
import { setCharVisibility, getPlayerLos } from '../../services/los';
import { getAdjacencyMatrix, getRemainingMvt, moveTowardsDest } from '../../services/aiMove';
import { findBestBurstPlacement} from '../../services/aiAct';

import { GameBoard, GameChar, Action, ActionResult, CharType, AiPlan } from '../../types';
import {TurnLog, RangeType, MetersEntry } from '../../uiTypes';

interface GameTabInput {startingBoard: GameBoard}

export default function GameTab({startingBoard}: GameTabInput) {
    const [board, setBoard] = useState<GameBoard>({...startingBoard});
    const [chars, setChars] = useState<GameChar[]>(board.chars);

    const startingLos: number[] = getPlayerLos(board);
    const [los, setLos] = useState<number[]>(startingLos);
    const [hasBeenSeen, setHasBeenSeen] = useState<number[]>(startingLos);

    const [turnIndex, setTurnIndex] = useState<number>(0);
    const [gameIsActive, setGameIsActive] = useState<boolean>(true);
    const [roundNumber, setRoundNumber] = useState<number>(1);

    const [turnLog, setTurnLog] = useState<TurnLog[]>(newTurnLog(chars[0]));
    const [meters, setMeters] = useState<MetersEntry[]>(createMeters(board.chars));

    const [selectedAction, setSelectedAction] = useState<Action | null>(null);

    const [mvtHighlight, setMvtHighlight] = useState<number[]>([]);
    const [actionHighlight, setActionHighlight] = useState<number[]>([]);
    const [aoeHighlight, setAoeHighlight] = useState<number[]>([]);

    const [charStatPaneChar, setCharStatPaneChar] = useState<GameChar | null>(null);

    let adjMatrix: number[][] = getAdjacencyMatrix(board);

    useEffect(() => {
        if(chars.length && chars[turnIndex].type !== CharType.player) aiTurn(chars[turnIndex])
    }, [turnIndex]);

    function endTurn(): void {
        let isNewRound: boolean = turnIndex === chars.length - 1;
        let newChars: GameChar[] = [...chars];
        let newTurnIndex: number = (turnIndex + 1) % chars.length;

        while(newChars[newTurnIndex].game.stats.hp <= 0) {
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
        setCharStatPaneChar(newChars[newTurnIndex].type === CharType.player ? newChars[newTurnIndex] : null);

        /*if(chars[newTurnIndex].type === CharType.player || chars[newTurnIndex].game.hasBeenSeen) {
            turnLog.unshift(logger.newTurn(chars[0].name));
            setTurnLog(turnLog);
        }*/
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
                } else {performAction([plan.target.game.positionIndex], plan.chosenAction)}
                
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
                        board, char.game.positionIndex, getRemainingMvt(char), RangeType.mvt
                    );
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

        const newChars: GameChar[] = [...chars];
        const newGameBoard: GameBoard = {...board};
        
        newChars[turnIndex].game.positionIndex = index;
        newChars[turnIndex].game.round.movementTaken += distanceMoved;
        newGameBoard.chars = newChars;

        if(newChars[turnIndex].type === CharType.player || newChars[turnIndex].game.isVisible) {
            turnLog[0].actions.push(logger.move(newChars[turnIndex].name, distanceMoved));
        } else if(newChars[turnIndex].game.hasBeenSeen) {
            turnLog[0].actions.push(logger.unseenMove(newChars[turnIndex].name))
        }

        adjMatrix = getAdjacencyMatrix(newGameBoard);
        setTurnLog(turnLog);
        setMvtHighlight([]);
        setChars(setCharVisibility(newGameBoard));
        setBoard(newGameBoard);
        
        if(newChars[turnIndex].type === CharType.player) {
            const playerLos: number[] = getPlayerLos(newGameBoard);
            setLos(playerLos);
            updateHasBeenSeen(playerLos);
        }
    }


    function setCharDest(char: GameChar, newDest: number): void {
        const newChar: GameChar = {...char};
        const newChars: GameChar[] = [...chars];
        newChar.game.destinationIndex = newDest;
        const oldChar: GameChar | undefined = chars.find(oldChar => oldChar.game.gameId === char.game.gameId);
        if(oldChar) {
            const oldCharIndex: number = chars.indexOf(oldChar);
            newChars[oldCharIndex] = newChar;
            setChars(newChars);
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
            const newChars: GameChar[] = [...chars];
            const targetCharTypes: CharType[] = getTargetTypes(action.intent, actor.type);
            const affectedChars: GameChar[] = newChars.filter(char => 
                affectedIndices.includes(char.game.positionIndex) && targetCharTypes.includes(char.type)
            ); 

            if(affectedChars.length && affectedChars.some(char => 
                !effectAlreadyApplied(char.game.activeEffects, actor.game.gameId, action.name)
            )) {
                const results: ActionResult[] = resolveAction(actor, affectedChars, action);
                
                for (let r = 0; r < results.length; r++) {
                    const thisChar: GameChar | undefined = chars.find(char => char.game.gameId === results[r].newChar.game.gameId);
                    if(thisChar) {
                        const targetIndex: number = chars.indexOf(thisChar);
                        chars[targetIndex] = results[r].newChar;

                        let newMeters: MetersEntry[] = [...meters];

                        for (let i = 0; i < results[r].effectResults.length; i++) {
                            const thisEffect = results[r].effectResults[i];                         
                            
                            switch(thisEffect.effect.type) {
                                case 'healing': newMeters = healingDone(
                                        meters, actor.game.gameId, thisEffect.effectiveAmount, thisEffect.effect.targetStat
                                    ); 
                                    break;
                                case 'damage': newMeters = dmgDoneAndTaken(
                                    meters, actor.game.gameId, chars[targetIndex].game.gameId, 
                                    thisEffect.effectiveAmount, thisEffect.effect.targetStat
                                ); break;
                                case 'buff': newMeters = statEffectsDone(meters, actor.game.gameId, thisEffect.effectiveAmount); 
                                    break;
                                default: break;
                            }
                        }

                        setMeters(newMeters);
                    }
                }
                
                turnLog[0].actions = [...turnLog[0].actions, ...logger.action(actor.name, results)];
                setTurnLog(turnLog);
                if(results.some(res => res.charDiedThisTurn)) {
                    results.forEach(res => {if(res.charDiedThisTurn) charDies(res.newChar.game.gameId)})
                }

                chars[turnIndex].game.round.actionTaken = true;
                chars[turnIndex].game.stats.mp -= action.mpCost;

                clearHighlights();
                setSelectedAction(null);
                setChars(chars);
            }
        }
    }

    function charDies(charId: string | undefined): void {
        if(charId) {
            const newChars: GameChar[] = [...chars];
            const newBoard: GameBoard = {...board};
            const targetChar: GameChar | undefined = newChars.find(char => charId === char.game.gameId);
            if(targetChar) {
                const charIndex: number = newChars.indexOf(targetChar);
                newChars[charIndex].game.stats.hp = 0;
                newChars[charIndex].game.positionIndex = -1;
                newBoard.chars = newChars;
                turnLog[0].actions.push(
                    logger.charDies(chars[turnIndex].name, targetChar.name)
                );
                setTurnLog(turnLog);
                setBoard(newBoard);
                setChars(newChars);
                setMeters(resetThreat(meters, charId));
            }

            const countOfPlayers: number = newBoard.chars.filter(
                char => char.type === CharType.player && char.game.stats.hp > 0
            ).length;
            const countOfEnemies: number = newBoard.chars.filter(
                char => char.type !== CharType.player && char.game.stats.hp > 0
            ).length;

            if(countOfPlayers === 0) {
                turnLog.unshift(logger.victory(CharType.enemy));
                setGameIsActive(false);
            } else if(countOfEnemies === 0) {
                turnLog.unshift(logger.victory(CharType.player));
                setGameIsActive(false);
            }
        }
    }

    function updateHasBeenSeen(newLos: number[]): void {
        const newHasBeenSeen: number[] = [...hasBeenSeen];
        for (let i = 0; i < newLos.length; i++) {
            if(!newHasBeenSeen.includes(newLos[i])) newHasBeenSeen.push(newLos[i])
        }
        setHasBeenSeen(newHasBeenSeen);
    }

    function clearHighlights(): void {
        if(mvtHighlight.length) setMvtHighlight([]);
        if(actionHighlight.length) setActionHighlight([]);
        if(aoeHighlight.length) setAoeHighlight([]);
    }

    function sleep(ms: number) {return new Promise(resolve => setTimeout(resolve, ms))}

    const actionFunctions = {
        endTurn: endTurn,
        showMovement: showMovement,
        selectAction: selectAction
    }

    const boardFunctions = {
        moveTo: moveTo,
        performAction: performAction,
        setCharStatChar: setCharStatPaneChar,
        aoeRange: aoeRange,
        setAoeHighlight: setAoeHighlight
    }

    function logChars(): void {console.log(chars)}
    function logMeters(): void {console.log(actionHighlight)}

    return (
        <div className="tab-container">
            <div className="top-bar">
                <button onClick={() => logChars()}>Log Chars</button>
                <button onClick={() => logMeters()}>Log Meters</button>
                <button onClick={() => endTurn()}>End Turn</button>
            </div>
            <div className="middle">
                <div className="left-side-panel">
                    <GameLog logs={turnLog} />
                    <Meters meters={meters} />
                    <CharStats char={charStatPaneChar} />                     
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
                            hasBeenSeen={hasBeenSeen}
                            boardFunctions={boardFunctions}
                        />
                    </div>
                    : ''
                }
                <div className="right-side-panel">
                    <Combatants 
                        chars={chars} 
                        gameIsActive={gameIsActive}
                        roundNumber={roundNumber}
                    />
                    <Actions 
                        char={chars[turnIndex]} 
                        actionFunctions={actionFunctions} 
                        gameIsActive={true}
                    />
                </div>
            </div>
        </div>
    )
}
