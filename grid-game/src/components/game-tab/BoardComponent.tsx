import './board.css';

import {createGameGrid, getBoardStyles} from '../../services/boards';

import HealthBar from './HealthBar';
import CharSquare from './CharSquare';

import {GameBoard, GameChar, Action} from '../../types';
import {GameSquare, TerrainType, Style} from '../../uiTypes';

interface BoardInput {
    board: GameBoard,
    mvtHighlight: number[],
    actionHighlight: number[],
    selectedAction: Action | null | undefined,
    aoeHighlight: number[],
    boardFunctions: any
}

export default function BoardComponent({
    board, mvtHighlight, actionHighlight, aoeHighlight, boardFunctions, selectedAction
}: BoardInput) {
    const grid: GameSquare[] = createGameGrid(board);
    const boardStyles = getBoardStyles(board);

    board.walls.forEach(w => grid[w].type = TerrainType.wall);
    board.chars.forEach((char: GameChar) => {
        if(char.game.positionIndex > -1) grid[char.game.positionIndex].char = char
    });

    function squareClassNames(index: number): string {
        const square: GameSquare = grid[index];
        let classNames: string = `square ${square.type}`;
        if(grid[index].char) classNames += ' char';
        if(mvtHighlight.includes(index)) classNames += ' move-range';
        if(selectedAction) {
            if(actionHighlight.includes(index)) {
                classNames += selectedAction.type === 'offense' ? ' offense-range' : ' defense-range';
            }
            if(aoeHighlight.includes(index)) {
                classNames += selectedAction.type === 'offense' ? ' off-aoe-range' : ' def-aoe-range';
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
                        ></div>
                    })
            }

        </div>
    )
}
