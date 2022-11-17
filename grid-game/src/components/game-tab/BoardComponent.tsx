import './board.css';

import { GiMagicPortal } from 'react-icons/gi';

import {createGameGrid, getBoardStyles} from '../../services/boards';

import CharSquare from './CharSquare';

import {GameBoard, GameChar, Action} from '../../types';
import {GameSquare, TerrainType, Style} from '../../uiTypes';

interface BoardInput {
    board: GameBoard,
    mvtHighlight: number[],
    actionHighlight: number[],
    aoeHighlight: number[],
    los: number[],
    hasBeenSeen: number[],
    selectedAction: Action | null | undefined,
    boardFunctions: any
}

export default function BoardComponent({
    board, mvtHighlight, actionHighlight, aoeHighlight, los, hasBeenSeen, boardFunctions, selectedAction
}: BoardInput) {
    const grid: GameSquare[] = createGameGrid(board);
    const boardStyles = getBoardStyles(board);

    board.walls.forEach(w => grid[w].type = TerrainType.wall);
    board.chars.forEach((char: GameChar) => {
        if(char.game.positionIndex > -1) grid[char.game.positionIndex].char = char
    });

    function squareClassNames(index: number): string {
        const square: GameSquare = grid[index];
        let classNames: string = 'square';
        if(!hasBeenSeen.includes(index)) {
            classNames += ' unseen'
        } else {
            classNames += ` seen ${square.type}`;
            if(!los.includes(index)) classNames += ' darken';
            if(grid[index].char) classNames += ' char';
            if(mvtHighlight.includes(index)) classNames += ' move-range';
            if(selectedAction) {
                if(actionHighlight.includes(index)) {
                    classNames += selectedAction.intent === 'offense' ? ' offense-range' : ' defense-range';
                }
                if(aoeHighlight.includes(index)) {
                    classNames += selectedAction.intent === 'offense' ? ' off-aoe-range' : ' def-aoe-range';
                }
            }
        }
        
        
        return classNames;
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
                    let thisSquareStyle: Style = boardStyles.square;
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
                            className={squareClassNames(index)}
                            style={thisSquareStyle}
                            onClick={() => clickSquare(index)}
                            onMouseOver={() => mouseOver(index)}
                        >
                            {isPortal && hasBeenSeen.includes(index) ? <GiMagicPortal className="portal-icon"/> : ''}
                        </div>
                    })
            }

        </div>
    )
}
