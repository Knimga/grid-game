import '../game-tab/board.css';
import './dungeonPane.css';

import { GiMagicPortal } from 'react-icons/gi';
import { GiWoodenDoor } from 'react-icons/gi';
import { FaSkull } from 'react-icons/fa';

import {createEditorGrid, getBoardStyles} from '../../services/boards';
import { getSpawnArea } from '../../services/ranger';
import { randId } from '../../services/detailStrings';

import {Board, DoorName} from '../../types/types';
import { EditorSquare, Style, TerrainType } from '../../types/uiTypes';

interface BoardEditInput {
    board: Board;
    wallColor: string;
    floorColor: string;
    clickSquare: Function;
}

export default function BoardEdit({board, wallColor, floorColor, clickSquare}: BoardEditInput) {
    const grid: EditorSquare[] = createEditorGrid(board);
    const boardStyles = getBoardStyles(board);
    const spawnAreas: number[] = getSpawnAreas();
    const doorPositions: number[] = board.doors.map(d => d.position);

    function getSpawnAreas(): number[] {
        let spawningPoints: number[] = [];
        const charPositions: number[] = board.chars.map(char => char.index);
        if(board.portal) spawningPoints.push(board.portal);
        if(board.doors.length) spawningPoints = [...spawningPoints, ...board.doors.map(d => d.position)];
        return spawningPoints.map(i => getSpawnArea(board, i, charPositions)).flat(1);
    }

    function getDoorName(position: number): string {
        const doorName: DoorName | undefined = board.doors.find(d => d.position === position)?.name;
        return doorName ? doorName[2] : '';
    }

  return (
    <div className="board" style={boardStyles.board}>
            {
                grid.map((square, index) => {
                    const isPortal: boolean = board.portal ? index === board.portal : false;
                    const isDoor: boolean = doorPositions.includes(index);
                    const doorName: string = isDoor ? getDoorName(index) : '';
                    const terrainColor: string = square.type === TerrainType.wall ? wallColor : floorColor;
                    const thisSquareStyle: Style = {
                        ...boardStyles.square, 
                        backgroundColor: terrainColor,
                        outline: '0.5px solid rgba(128, 128, 128, .75)'
                    }

                    if(spawnAreas.includes(index)) thisSquareStyle.filter = 'brightness(1.5)';
                    if(square.char) thisSquareStyle.backgroundColor = square.char.color;
                    
                    return <div
                        key={randId()}
                        className='square'
                        style={thisSquareStyle}
                        onClick={() => clickSquare(index)}
                    >
                        {square.char ? 
                            <div className="editor-char-square">
                                <span className="char-square-name">{square.char.name}</span>
                                {square.char.isBoss ? <FaSkull/> : ''}
                            </div>
                             : ''}
                        {isPortal ? <GiMagicPortal className="portal-icon"/> : ''}
                        {isDoor ? 
                            <div className="door-square-container">
                                <GiWoodenDoor className="door-icon"/>
                                <small>{doorName}</small>
                            </div>
                        : ''}
                    </div>
                })
            }

        </div>
  )
}
