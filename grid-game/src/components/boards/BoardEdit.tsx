import '../game-tab/board.css';

import {createEditorGrid, getBoardStyles} from '../../services/boards';

import {Board} from '../../types';
import { EditorSquare, Style } from '../../uiTypes';

interface BoardEditInput {
    board: Board,
    clickSquare: Function
}

export default function BoardEdit({board, clickSquare}: BoardEditInput) {
    const grid: EditorSquare[] = createEditorGrid(board);
    const boardStyles = getBoardStyles(board);

    function rand(): string {return Math.random().toString()}

  return (
    <div className="board" style={boardStyles.board}>
            {
                grid.map((square, index) => {
                    let thisSquareStyle: Style = boardStyles.square;

                    if(square.char) {
                        thisSquareStyle = {...thisSquareStyle, backgroundColor: square.char.color}
                    }
                    
                    return <div
                        key={rand()}
                        className={`square ${square.type}`}
                        style={thisSquareStyle}
                        onClick={() => clickSquare(index)}
                    >
                        {square.char ? <span className="square-char-name">{square.char.name}</span> : ''}
                    </div>
                })
            }

        </div>
  )
}
