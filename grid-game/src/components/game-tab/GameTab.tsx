import './gameTab.css';
import urls from '../../urls';

import {useState, useEffect} from 'react';
import {Button} from '@mui/material';

import BoardComponent from './BoardComponent';
import Combatants from './Combatants';
import Actions from './Actions';
import GameLog from './GameLog';
import CharStats from './CharStats';
import Meters from './Meters';

import { rollD20 } from '../../services/roller';
import { blankGameBoard } from '../../services/boards';
import { resolveAction, getTargetTypes, setNewRound } from '../../services/actions';
import { getInRangeIndices, getAoeLineIndices, distance } from '../../services/ranger';
import { logger } from '../../services/logger';
import { createMeters, dmgDoneAndTaken, healingDone, statEffectsDone, resetThreat } from '../../services/meters';
import { setVisibility, visiblePlayers, canSeePlayers } from '../../services/los';

import { 
    getAdjacencyMatrix, newExploreDestination, getInRangeDest, getRemainingMvt, 
    moveTowardsDest, randomMoveToIndex
} from '../../services/aiMove';

import { 
    hasHealSpellAndMana, whoNeedsHealing, selectOffensiveAction, selectHeal, selectTarget, hasBuff, selectBuff,
    findBestBurstPlacement, getNearestPlayer
} from '../../services/aiAct';

import { GameBoard, GameChar, Action, ActionResult, CharType } from '../../types';

import {BoardSelection, TurnLog, RangeType, MetersEntry } from '../../uiTypes';

export default function GameTab() {
    const [boardSelections, setBoardSelections] = useState<BoardSelection[]>([]);
    const [board, setBoard] = useState<GameBoard>(blankGameBoard());
    const [chars, setChars] = useState<GameChar[]>([]);

    const [mvtHighlight, setMvtHighlight] = useState<number[]>([]);
    const [actionHighlight, setActionHighlight] = useState<number[]>([]);
    const [aoeHighlight, setAoeHighlight] = useState<number[]>([]);

    const [selectedAction, setSelectedAction] = useState<Action | null>(null);

    const [turnIndex, setTurnIndex] = useState<number>(0);
    const [gameIsActive, setGameIsActive] = useState<boolean>(false);
    const [roundNumber, setRoundNumber] = useState<number>(1);

    const [turnLog, setTurnLog] = useState<TurnLog[]>([]);
    const [meters, setMeters] = useState<MetersEntry[]>([]);

    const [charStatPaneChar, setCharStatPaneChar] = useState<GameChar | null>(null);

    let adjMatrix: number[][] = getAdjacencyMatrix(board);
    const sleepMs: number = 2000;

    useEffect(() => {
        const loadBoardSelections = async () => {
            const res = await fetch(urls.localRoot+urls.boards.getSelections);
            const selections: BoardSelection[] = await res.json();
            setBoardSelections(selections);
        }
        loadBoardSelections();
    },[]);

    
    useEffect(() => {
        if(chars.length && chars[turnIndex].type !== CharType.player) aiTurn(chars[turnIndex])
    }, [turnIndex]);

    async function selectBoard(_id: string) {
        const res = await fetch(urls.localRoot+urls.boards.getGameBoardById(_id));
        const newBoard: GameBoard = await res.json();
        let newChars: GameChar[] = setVisibility(newBoard);
        newChars = rollInitiative(newChars);
        setBoard(newBoard);
        setChars(newChars);
        setMeters(createMeters(newChars));
        setGameIsActive(false);
    }

    function startGame(): void {
        turnLog.unshift(logger.beginGame());
        turnLog.unshift(logger.newRound(1));
        turnLog.unshift(logger.newTurn(chars[0].name));
        setGameIsActive(true);
        setTurnLog(turnLog);
        
        if(chars.length && chars[turnIndex].type !== CharType.player) aiTurn(chars[turnIndex]);
    }

    function rollInitiative(currentChars: GameChar[]): GameChar[] {
        let newChars: GameChar[] = currentChars;
        newChars.forEach(char => char.game.iniRoll = rollD20(char.stats.ini).result);
        newChars = newChars.sort((a,b) => {return b.game.iniRoll - a.game.iniRoll});
        newChars[0].game.isTurn = true;
        return newChars;
    }

    function endTurn(): void {
        let isNewRound: boolean = turnIndex === chars.length - 1;
        let newChars: GameChar[] = [...chars];
        let newTurnIndex: number = (turnIndex + 1) % chars.length;

        while(newChars[newTurnIndex].game.stats.hp === 0) {
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
        turnLog.unshift(logger.newTurn(newChars[newTurnIndex].name));

        setTurnIndex(newTurnIndex);
        setChars(newChars);
        setSelectedAction(null);
        clearHighlights();

        if(newChars[newTurnIndex].type === CharType.player) {
            setCharStatPaneChar(newChars[newTurnIndex])
        } else {setCharStatPaneChar(null)}
    }

    async function aiTurn(char: GameChar) {
        if(char.type !== CharType.player) {
            const isBeast: boolean = char.type === CharType.beast;
            const exploreMode: boolean = isBeast ? !canSeePlayers(board, char.game.positionIndex) 
                : (visiblePlayers(chars).length ? false : true);
            const needsHealing: GameChar | null = whoNeedsHealing(board);
            const sleepLength: number = chars[turnIndex].game.isVisible ? 2000 : 500;
            let newDest: number | null = null;
            let target: GameChar | null = null;
            let chosenAction: Action | null = null;
    
            if(hasHealSpellAndMana(char) && needsHealing) {
                chosenAction = selectHeal(char);
                target = needsHealing;
                //console.log(`${char.name} selected ${chosenAction.name}, targeting ${target.name}`);
                newDest = getInRangeDest(board, char, chosenAction, target.game.positionIndex, adjMatrix);
                setCharDest(char, newDest);
            } else if(!exploreMode) {
                target = selectTarget(board, char, meters);
                const targetIsAdjacent: boolean = distance(
                    char.game.positionIndex, target.game.positionIndex, board.gridWidth
                ) === 1;
                chosenAction = selectOffensiveAction(char, targetIsAdjacent);
                //console.log(`${char.name} selected ${chosenAction.name}, targeting ${target.name}`);
                newDest = getInRangeDest(board, char, chosenAction, target.game.positionIndex, adjMatrix);
                if(!newDest) {
                    target = getNearestPlayer(board, char.game.positionIndex, adjMatrix)
                    newDest = getInRangeDest(board, char, chosenAction, target.game.positionIndex, adjMatrix);
                }
                setCharDest(char, newDest);                   
            } else {
                if(roundNumber === 1 && hasBuff(char)) {
                    chosenAction = selectBuff(char);
                    target = char;
                }
                if((!char.game.destinationIndex || char.game.positionIndex === char.game.destinationIndex)
                    && !isBeast) {
                    const newExploreDest: number = newExploreDestination(board, char.game.positionIndex);
                    newDest = newExploreDest;
                    setCharDest(char, newDest);
                }
                if(isBeast) {
                    newDest = randomMoveToIndex(board, char);
                    setCharDest(char, newDest);
                }
            }
        
            await sleep(sleepLength);
            
            if(char.game.destinationIndex) await moveCycle(char.game.destinationIndex);

            if(chosenAction && target && newDest === char.game.positionIndex) {
                selectAction(chosenAction);

                await sleep(sleepLength);

                if(['burst','line'].includes(chosenAction.target)) {
                    let aoeTargetIndex: number = target.game.positionIndex;

                    if(chosenAction.hasOwnProperty('burstRadius')) {
                        aoeTargetIndex = chosenAction.range === 0  ? 
                        char.game.positionIndex : findBestBurstPlacement(
                            board, chosenAction, char.game.gameId, target.game.positionIndex, adjMatrix
                        );
                    }
                    
                    const aoeEffectIndices: number[] = aoeRange(aoeTargetIndex, chosenAction);
                    setAoeHighlight(aoeEffectIndices);
                    await sleep(sleepLength);
                    performAction(aoeEffectIndices, chosenAction);
                } else {performAction([target.game.positionIndex], chosenAction)}
                
                await sleep(sleepLength);
            }

            endTurn();

        } else {console.log(`${char.name} is not enemy/beast`)}
    }

    async function moveCycle(destIndex: number) {
        if(chars[turnIndex].game.destinationIndex) {
            //console.log(`moveCycle destination: ${chars[turnIndex].game.destinationIndex}`);
            const sleepLength: number = chars[turnIndex].game.isVisible ? 2000 : 500;

            while(getRemainingMvt(chars[turnIndex]) > 0 && destIndex !== chars[turnIndex].game.positionIndex) {
                const currentChar: GameChar = chars[turnIndex];

                if(currentChar.game.isVisible) {
                    const mvtRangeIndices = getInRangeIndices(
                        board, currentChar.game.positionIndex, getRemainingMvt(currentChar), RangeType.mvt
                    );
                    setMvtHighlight(mvtRangeIndices);
                }
                await sleep(sleepLength);
    
                const moveToIndex: number = moveTowardsDest(board, currentChar, destIndex, adjMatrix);
                //console.log(moveToIndex);
                moveTo(moveToIndex);
                
                await sleep(sleepLength);
            }

        } else {console.log('no char.game.destinationIndex')}
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

    function sleep(ms: number) {return new Promise(resolve => setTimeout(resolve, ms))}

    function clearHighlights(): void {
        if(mvtHighlight.length) setMvtHighlight([]);
        if(actionHighlight.length) setActionHighlight([]);
        if(aoeHighlight.length) setAoeHighlight([]);
    }

    function showMovement(): void {
        if(mvtHighlight.length) {
            setMvtHighlight([])
        } else {
            const mover: GameChar = chars[turnIndex];
            const mvtRemaining: number = mover.game.stats.mvt - mover.game.round.movementTaken;
            if(board) {
                const mvtIndices: number[] = getInRangeIndices(
                    board, mover.game.positionIndex, mvtRemaining, RangeType.mvt
                );
                if(actionHighlight.length) setActionHighlight([]);
                setMvtHighlight(mvtIndices);
            }
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
                toggleRange(action.range, RangeType.atk)
            }
        }
    }

    function toggleRange(range: number, rangeType: RangeType): void {
        const attacker: GameChar = chars[turnIndex];
        const povIndex: number = attacker.game.positionIndex;
        if(board) {
            const indices: number[] = getInRangeIndices(board, povIndex, range, rangeType);
            if(mvtHighlight.length) setMvtHighlight([]);
            setActionHighlight(indices);
        } 
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

    function moveTo(index: number): void {
        if(board && Number(index)) {
            const movingChar: GameChar = chars[turnIndex];
            const startingPosition: number = movingChar.game.positionIndex;
            const distanceMoved: number = distance(startingPosition, index, board.gridWidth);

            const newChars: GameChar[] = [...chars];
            const newGameBoard: GameBoard = {...board};
           
            newChars[turnIndex].game.positionIndex = index;
            newChars[turnIndex].game.round.movementTaken += distanceMoved;
            newGameBoard.chars = newChars;

            turnLog[0].actions.push(logger.move(movingChar.name, distanceMoved));
            adjMatrix = getAdjacencyMatrix(newGameBoard);
            setTurnLog(turnLog);
            setMvtHighlight([]);
            setChars(setVisibility(newGameBoard));
            setBoard(newGameBoard);
        } else {console.log(`moveTo error: ${index}`)}
    }
    
    function performAction(affectedIndices: number[], actionInput?: Action): void {
        const actor: GameChar = chars[turnIndex];
        const action: Action | null = actionInput ? actionInput : selectedAction;

        if(action && !actor.game.round.actionTaken && actor.game.stats.mp >= action.mpCost) {
            const newChars: GameChar[] = [...chars];
            const targetCharTypes: CharType[] = getTargetTypes(action.type, actor.type);
            const affectedChars: GameChar[] = newChars.filter(char => 
                affectedIndices.includes(char.game.positionIndex) && targetCharTypes.includes(char.type)
            ); 

            if(affectedChars.length) {
                const results: ActionResult[] = resolveAction(actor, affectedChars, action);
                
                for (let r = 0; r < results.length; r++) {
                    const thisChar: GameChar | undefined = chars.find(char => char.game.gameId === results[r].newChar.game.gameId);
                    if(thisChar) {
                        const targetIndex: number = chars.indexOf(thisChar);
                        chars[targetIndex] = results[r].newChar;
                        //if(results[r].charDiedThisTurn) charDies(thisChar.game.gameId);

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

    function toggleDash(dashOn: boolean): void {
        const newChars: GameChar[] = [...chars];
        if(dashOn) {
            newChars[turnIndex].game.stats.mvt += newChars[turnIndex].stats.mvt;
            newChars[turnIndex].game.round.actionTaken = true;
        } else {
            if(chars[turnIndex].game.stats.mvt !== chars[turnIndex].stats.mvt) {
                newChars[turnIndex].game.stats.mvt -= newChars[turnIndex].stats.mvt;
                newChars[turnIndex].game.round.actionTaken = false;
            }
        }
        setChars(newChars);
    }

    function charDies(charId: string | undefined): void {
        if(board && charId) {
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

    const actionFunctions = {
        endTurn: endTurn,
        showMovement: showMovement,
        selectAction: selectAction,
        toggleDash: toggleDash
    }

    const boardFunctions = {
        moveTo: moveTo,
        performAction: performAction,
        setCharStatChar: setCharStatPaneChar,
        aoeRange: aoeRange,
        setAoeHighlight: setAoeHighlight
    }

    function logChars(): void {console.log(chars)}
    function logMeters(): void {console.log(meters)}

    return (
        <div className="gametab-container">
            <div className="top-bar">
                <select
                    onChange={(e) => selectBoard(e.target.options[e.target.selectedIndex].value)}
                >
                    <option hidden={true}>Select a board...</option>
                    {
                        boardSelections.map((selection: BoardSelection) =>
                            <option key={selection._id} value={selection._id}>{selection.name}</option>
                        )
                    }
                </select>
                <button onClick={() => logChars()}>Log Chars</button>
                <button onClick={() => logMeters()}>Log Meters</button>
                <button onClick={() => endTurn()}>End Turn</button>
                <Button 
                    variant="contained" 
                    disabled={gameIsActive}
                    onClick={() => startGame()}
                >Start Game</Button>
            </div>
            <div className="middle">
                <div className="left-side-panel">
                    <GameLog logs={turnLog} />
                    <Meters meters={meters} />
                    <CharStats char={charStatPaneChar} />                     
                </div>
                {
                    board ? 
                    <div className="board-container">
                        <BoardComponent 
                            board={board} 
                            mvtHighlight={mvtHighlight}
                            actionHighlight={actionHighlight}
                            selectedAction={selectedAction}
                            aoeHighlight={aoeHighlight}
                            boardFunctions={boardFunctions}
                        />
                    </div>
                    : ''
                }
                <div className="right-side-panel">
                    <Combatants 
                        chars={chars} 
                        turnIndex={turnIndex} 
                        gameIsActive={gameIsActive}
                        roundNumber={roundNumber}
                    />
                    <Actions 
                        char={chars[turnIndex]} 
                        actionFunctions={actionFunctions} 
                        gameIsActive={gameIsActive}
                    />
                </div>
            </div>
        </div>
    )
}
