import '../game-tab/board.css';
import './boardsTab.css';

import { GiMagicPortal } from 'react-icons/gi';

import {createEditorGrid, getBoardStyles} from '../../services/boards';
import { getSpawnArea } from '../../services/ranger';

import {Board} from '../../types';
import { EditorSquare, Style } from '../../uiTypes';

interface BoardEditInput {
    board: Board,
    clickSquare: Function
}

export default function BoardEdit({board, clickSquare}: BoardEditInput) {
    const grid: EditorSquare[] = createEditorGrid(board);
    const boardStyles = getBoardStyles(board);
    const spawnAreas: number[] = getSpawnAreas();

    function getSpawnAreas(): number[] {
        let indices: number[] = [];
        const charPositions: number[] = board.chars.map(char => char.index);
        if(board.portal) indices = [...indices, ...getSpawnArea(board, board.portal, charPositions)];
        return indices;
    }

    function rand(): string {return Math.random().toString()}

    function squareClassNames(index: number): string {
        let classNames: string = `square editor-square ${grid[index].type}`;

        if(spawnAreas.includes(index)) classNames += ' entry-square-range';
        
        return classNames;
    }

  return (
    <div className="board" style={boardStyles.board}>
            {
                grid.map((square, index) => {
                    const isPortal: boolean = board.portal ? index === board.portal : false;
                    let thisSquareStyle: Style = boardStyles.square;

                    if(square.char) {
                        thisSquareStyle = {...thisSquareStyle, backgroundColor: square.char.color}
                    }
                    
                    return <div
                        key={rand()}
                        className={squareClassNames(index)}
                        style={thisSquareStyle}
                        onClick={() => clickSquare(index)}
                    >
                        {square.char ? <span className="char-square-name">{square.char.name}</span> : ''}
                        {isPortal ? <GiMagicPortal className="portal-icon"/> : ''}
                    </div>
                })
            }

        </div>
  )
}
