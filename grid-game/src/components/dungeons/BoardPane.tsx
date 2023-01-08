import './boardPane.css';

import MiniBoardMap from './MiniBoardMap';

import { Board } from "../../types"

interface BoardPaneInput {
    board: Board;
    floorColor: string;
    wallColor: string;
    index: number;
    isSelected: boolean;
    clickBoard: Function;
}

export default function BoardPane({board, floorColor, wallColor, index, isSelected, clickBoard}: BoardPaneInput) {

  return (
    <div 
        className={`pane dungeon-board-pane ${isSelected ? 'dungeon-board-pane-selected': ''}`} 
        onClick={() => clickBoard(index)}
    >
        <div className="centered-flex-row">
            <strong>{board.name}</strong>
        </div>
        <div className="centered-flex-row">
            <div className="half-width-flex-column centered">
                <MiniBoardMap board={board} floorColor={floorColor} wallColor={wallColor}/>
            </div>
            <div className="half-width-flex-column">
                <small>{`Size: ${board.gridWidth}x${board.gridHeight}`}</small>
                <small>{`Doors: ${board.doors.map(d => d.name[2])}`}</small>
            </div>
        </div>
    </div>
  )
}
