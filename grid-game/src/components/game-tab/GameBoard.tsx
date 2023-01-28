import './board.css';

import { GiMagicPortal } from 'react-icons/gi';
import { GiWoodenDoor } from 'react-icons/gi';

import {createGameGrid, getBoardStyles} from '../../services/boards';
import { getTargetTypes } from '../../services/actions';

import CharSquare from './CharSquare';

import {GameBoard, GameChar, Action, Door} from '../../types/types';
import {CharType} from '../../types/enums';
import {GameSquare, Style} from '../../types/uiTypes';

interface BoardInput {
    board: GameBoard;
    colorScheme: {wall: string; floor: string;};
    mvtHighlight: number[];
    rangeHighlight: number[];
    targetHighlight: number[];
    los: number[];
    selectedAction: Action | null;
    roomIsClear: boolean;
    selectedDoor: Door | null;
    boardFunctions: any;
}

export default function GameBoardComponent({
    board, colorScheme, boardFunctions, selectedAction, selectedDoor, roomIsClear,
    mvtHighlight, rangeHighlight, targetHighlight, los
}: BoardInput) {
    const grid: GameSquare[] = createGameGrid(board);
    const sizeStyles = getBoardStyles(board);
    const doorIndices: number[] = board.doors.map(d => d.position);
    
    const inRangeFilter: string = 'brightness(1.5)';
    const targetFilter: string = 'brightness(1.8)';
    const fogOfWarFilter: string = 'blur(4px)';
    const defensiveTargetBoxShadow: string = '0 0 20px 5px cyan';
    const offensiveTargetBoxShadow: string = '0 0 20px 5px red';
    const enabledDoorBoxShadow: string = '0 0 20px 5px lightblue';
    const selectedDoorBoxShadow: string = '0 0 20px 5px cyan';

    function squareStyle(index: number): Style {
        let bgColor: string = grid[index].type === 'floor' ? colorScheme.floor : colorScheme.wall;
        let filter: string = '', outline = '', boxShadow = '';

        if(!board.exploredAreas.includes(index)) {
            bgColor = 'black'
        } else {
            outline = '0.5px solid rgba(128, 128, 128, .75)';
            if(!los.includes(index)) filter = fogOfWarFilter;
            if(selectedAction) {
                if(rangeHighlight.includes(index)) filter = inRangeFilter;
                if(targetHighlight.includes(index)) filter = targetFilter;
            } else if(mvtHighlight.includes(index)) filter = inRangeFilter;
        }

        return {
            ...sizeStyles.square,
            backgroundColor: bgColor,
            filter: filter,
            outline: outline,
            boxShadow: boxShadow
        };
    }

    function getActorType(): CharType {
        const actor: GameChar | undefined = board.chars.find(c => c.game.isTurn);
        if(actor) {return actor.type} else {console.log('omg'); return CharType.player}
    }

    function charIsTargeted(char: GameChar | undefined, action: Action): boolean {
        if(!char) return false;
        const targetTypes: CharType[] = getTargetTypes(action.intent, getActorType());
        return targetTypes.includes(char.type);
    }

    function doorStyle(door: Door): Object {
        const color: string = roomIsClear ? 'white' : 'lightgray';
        let boxShadow: string = '';

        if(roomIsClear) {
            boxShadow = enabledDoorBoxShadow;
            if(selectedDoor?.position === door.position) boxShadow = selectedDoorBoxShadow;
        }

        return {color: color, boxShadow: boxShadow}
    }

    function charStyle(index: number): Object {
        let boxShadow: string = '';
        if(selectedAction) {
            if(targetHighlight.includes(index)) {
                if(charIsTargeted(grid[index].char, selectedAction)) {
                    switch(selectedAction.intent) {
                        case 'defense': boxShadow = defensiveTargetBoxShadow; break;
                        case 'offense': boxShadow = offensiveTargetBoxShadow; break;
                        default: break;
                    }
                }
            }
        }
        return {...sizeStyles.square, boxShadow: boxShadow, zIndex: 2}
    }

    function clickSquare(index: number): void {
        console.log(index);
        if(mvtHighlight.includes(index)) {
            boardFunctions.moveTo(index)
        } else if(rangeHighlight.includes(index) && selectedAction) {
            const affectedIndices: number[] = targetHighlight.length ? targetHighlight : [index];
            if(affectedIndices.some(i => {return grid[i].char ? true : false})) {
                boardFunctions.performAction(affectedIndices)
            } else {console.log('no char on target square')}
        } else if(doorIndices.includes(index)) {
            boardFunctions.clickDoor(index)
        }
    }

    function mouseOver(index: number): void {
        if(selectedAction) {
            if(rangeHighlight.includes(index)) {
                boardFunctions.setTargetHighlight(boardFunctions.aoeRange(index))
            } else {boardFunctions.setTargetHighlight([])}
        }
    }

    return (
        <div className="board" style={sizeStyles.board}>
            {
                grid.map((square, index) => {
                    const isPortal: boolean = board.portal ? index === board.portal : false;
                    const door = board.doors.find(d => d.position === index);
                    let showChar: boolean = false;
                
                    if(square.char) {
                        //showChar = true;   //to always reveal all chars
                        showChar = square.char.type !== 'player' && !square.char.game.isVisible ? false : true;                        
                    }
                    
                    return showChar && square.char ? 
                        <CharSquare 
                            char={square.char}
                            key={square.char.game.gameId}
                            style={charStyle(index)}
                            index={index}
                            onClick={() => clickSquare(index)}
                            onMouseOver={() => mouseOver(index)}    
                        />
                        :
                        <div
                            key={index}
                            className="square"
                            style={squareStyle(index)}
                            onClick={() => clickSquare(index)}
                            onMouseOver={() => mouseOver(index)}
                        >
                            {isPortal && board.exploredAreas.includes(index) ? <GiMagicPortal className="portal-icon"/> : ''}
                            {door && board.exploredAreas.includes(index) ? 
                                <GiWoodenDoor className="door-icon" style={doorStyle(door)}/> : ''
                            }
                        </div>
                    })
            }

        </div>
    )
}
