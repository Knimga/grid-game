import './board.css';

import { GiMagicPortal } from 'react-icons/gi';
import { GiWoodenDoor } from 'react-icons/gi';

import {createGameGrid, getBoardStyles} from '../../services/boards';

import CharSquare from './CharSquare';

import {GameBoard, Action} from '../../types';
import {GameSquare, Style} from '../../uiTypes';

interface BoardInput {
    board: GameBoard;
    colorScheme: {wall: string; floor: string;};
    mvtHighlight: number[];
    actionHighlight: number[];
    aoeHighlight: number[];
    los: number[];
    hasBeenSeen: number[];
    selectedAction: Action | null | undefined;
    roomIsClear: boolean;
    boardFunctions: any;
}

export default function BoardComponent({
    board, colorScheme, boardFunctions, selectedAction, roomIsClear,
    mvtHighlight, actionHighlight, aoeHighlight, los, hasBeenSeen
}: BoardInput) {
    const grid: GameSquare[] = createGameGrid(board);
    const boardStyles = getBoardStyles(board);

    function squareStyle(index: number): Style {
        const squareSize: Style = boardStyles.square;
        let bgColor: string = grid[index].type === 'floor' ? colorScheme.floor : colorScheme.wall;
        let filter: string = '';
        let outline: string = '';

        if(!hasBeenSeen.includes(index)) {
            bgColor = 'black'
        } else {
            outline = '0.1px solid gray';
            if(!los.includes(index)) filter = 'brightness(0.7)';
            if(selectedAction) {
                if(actionHighlight.includes(index)) {
                    filter = 'brightness(1.5)' //used to be red or blue based on selectedAction.intent
                }
                if(aoeHighlight.includes(index)) {
                    filter = 'brightness(1.8)' //used to be red or blue based on selectedAction.intent
                }
            } else if(mvtHighlight.includes(index)) filter = 'brightness(1.5)';
        }

        return {
            ...squareSize,
            backgroundColor: bgColor,
            filter: filter,
            outline: outline
        };
    }

    function clickSquare(index: number): void {
        console.log(index);
        if(mvtHighlight.includes(index)) {
            boardFunctions.moveTo(index)
        } else if(actionHighlight.includes(index) && selectedAction) {
            const affectedIndices: number[] = aoeHighlight.length ? aoeHighlight : [index];
            if(affectedIndices.some(i => {return grid[i].char ? true : false})) {
                boardFunctions.performAction(affectedIndices)
            } else {console.log('no char on target square')}
        } else if(grid[index].char /*&& grid[index].char?.type === 'player'*/) {
            boardFunctions.setCharStatChar(grid[index].char)
        }
    }

    function mouseOver(index: number): void {
        if(selectedAction) {
            if(actionHighlight.includes(index)) {
                boardFunctions.setAoeHighlight(boardFunctions.aoeRange(index))
            } else {boardFunctions.setAoeHighlight([])}
        }
    }

    return (
        <div className="board" style={boardStyles.board}>
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
                            style={boardStyles.square}
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
                            {isPortal && hasBeenSeen.includes(index) ? <GiMagicPortal className="portal-icon"/> : ''}
                            {door && hasBeenSeen.includes(index) ? 
                                <GiWoodenDoor className="door-icon" style={roomIsClear ? {color: 'white'} : {}}/> : ''
                            }
                        </div>
                    })
            }

        </div>
    )
}
