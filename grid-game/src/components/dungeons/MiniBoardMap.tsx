import './miniBoardMap.css';

import { getBoardStyles, createEditorGrid } from "../../services/boards"
import { randId } from '../../services/detailStrings';

import { Board } from "../../types";
import { EditorSquare, TerrainType } from "../../uiTypes";


interface MiniBoardMapInput {
    board: Board,
    floorColor: string,
    wallColor: string
}

interface SquareStyle {
    width: number;
    height: number;
    backgroundColor: string;
}

export default function MiniBoardMap({board, floorColor, wallColor}: MiniBoardMapInput) {
    const boardStyles = getBoardStyles(board, {width: 100, height: 100});
    const squares: EditorSquare[] = createEditorGrid(board);
    const doorPositions: number[] = board.doors.map(d => d.position);
    const enemyPositions: number[] = board.chars.map(c => c.index);

    const squareStyles: SquareStyle[] = squares.map((s, index) => {
        const backgroundColor: string = getBackgroundColor(s, index);
        return {
            ...boardStyles.square,
            backgroundColor: backgroundColor
        }
    });

    function getBackgroundColor(square: EditorSquare, index: number): string {
        if(board.portal === index) return 'aqua';
        if(doorPositions.includes(index)) return 'lightgray';

        if(enemyPositions.includes(index)) {
            const color: string | undefined = board.chars.find(c => c.index === index)?.color;
            if(color) return color;
        }

        switch(square.type) {
            case TerrainType.wall: return wallColor;
            case TerrainType.floor: return floorColor;
            default: return '';
        }
    }

  return (
    <div className="mini-board-container">
        <div className="mini-board" style={boardStyles.board}>
            {squareStyles.map((style) => <div style={style} key={randId()}></div>)}
        </div>
    </div>
  )
}
