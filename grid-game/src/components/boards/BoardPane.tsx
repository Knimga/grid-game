import './boardPane.css';

import { Board } from "../../types";

interface BoardPaneInput {
    board: Board,
    isSelected: boolean,
    clickPane: Function
}

export default function BoardPane({board, isSelected, clickPane}: BoardPaneInput) {

    function click(): void {clickPane(board)}

    function charListString(): string {
        return board.chars.length ? board.chars.map(char => char.name).join(', ') : 'None';
    }

  return (
    <div className={`pane board-pane ${isSelected ? 'selected' : ''}`} onClick={() => click()}>
        <strong>{board.name}</strong>
        <small>{`${board.gridWidth}x${board.gridHeight}`}</small>
        <small className="board-char-list">
            {`Characters: ${charListString()}`}
        </small>
    </div>
  )
}
