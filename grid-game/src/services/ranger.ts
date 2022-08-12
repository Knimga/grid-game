import {GameBoard, Action} from '../types';
import {RangeType} from '../uiTypes';

type Coord = [number, number];

export function getInRangeIndices(
    gameBoard: GameBoard,
    position: number, 
    range: number,
    rangeType?: RangeType
): number[] {
    if(range === 0) return [position];

    const grid: number[][] = makeGrid(gameBoard);
    const actorCoord: Coord = indexToCoord(position, gameBoard.gridWidth);
    const inRangeIndices: number[] = [];

    for (let row = 0; row < gameBoard.gridHeight; row++) {
        for (let col = 0; col < gameBoard.gridWidth; col++) {
            if(coordDistance(actorCoord, [row, col]) <= range) {
                const lineCoords: Coord[] = getLine(actorCoord[0], actorCoord[1], row, col);
                //const reverseLine: Coord[] = getLine(row, col, actorCoord[0], actorCoord[1]);

                if(lineCoords.every(coord => grid[coord[0]][coord[1]] !== 2)) {
                    lineCoords.forEach(coord => {
                        const index: number = coordToIndex(coord, gameBoard.gridWidth);
                        grid[coord[0]][coord[1]] = 1;
                        if(!inRangeIndices.includes(index)) inRangeIndices.push(index);
                    })
                }
            }
        }
    }

    if(rangeType === RangeType.mvt) {
        const indicesWithChars: number[] = gameBoard.chars.map(char => char.game.positionIndex);
        for (let i = 0; i < indicesWithChars.length; i++) {
            if(inRangeIndices.includes(indicesWithChars[i])) {
                const targetIndex: number = inRangeIndices.indexOf(indicesWithChars[i]);
                inRangeIndices.splice(targetIndex, 1);
            }
        }
    }

    return inRangeIndices;
}

export function getAdjacentCoords(coord: Coord, gridWidth: number, gridHeight: number): Coord[] {
    const x: number = coord[0], y: number = coord[1];
    let adjCoords: Coord[] = [
        [x + 1, y],
        [x + 1, y - 1],
        [x + 1, y + 1],
        [x, y - 1],
        [x - 1, y - 1],
        [x - 1, y],
        [x - 1, y + 1],
        [x, y + 1]
    ];

    adjCoords = adjCoords.filter(coord => {
        const x = coord[0], y = coord[1];
        return x >= 0 && y >= 0 && x <= gridHeight - 1 && y <= gridWidth - 1;  
    });

    return adjCoords;
}

/*function coordLog(coords: Coord[]): string {
    if(!coords.length) return 'none!';
    let log = '  ';
    coords.forEach((coord) => log += coord.toString() + '   ')
    return log;
}*/

function makeGrid(gameBoard: GameBoard): number[][] {
    const squareCount: number = gameBoard.gridHeight * gameBoard.gridWidth;
    const newGrid: number[][] = [];

    for (let i = 0; i < squareCount; i++) {
        const currentRow: number = Math.floor(i / gameBoard.gridWidth);
        if(!newGrid[currentRow]) newGrid.push([]);
        newGrid[currentRow].push(gameBoard.walls.includes(i) ? 2 : 0);
    }

    return newGrid;
}

export function distance(index1: number, index2: number, gridWidth: number): number {
    const coord1: Coord = indexToCoord(index1, gridWidth);
    const coord2: Coord = indexToCoord(index2, gridWidth);
    return coordDistance(coord1, coord2);
}

export function indexToCoord(i: number, gridWidth: number): Coord {
    return [Math.floor(i / gridWidth), i % gridWidth];
}

export function coordToIndex(coord: Coord, gridWidth: number): number {
    return (coord[0] * gridWidth) + coord[1]
}

function coordDistance(coord1: Coord, coord2: Coord): number {
    const xDif: number = Math.abs(coord2[0] - coord1[0]);
    const yDif: number = Math.abs(coord2[1] - coord1[1]);
    return xDif > yDif ? xDif : yDif;
}

function getLine(x0: number, y0: number, x1: number, y1: number): Coord[] {
    const lineCoords: Coord[] = [];

    const xDistance: number = Math.abs(x1 - x0);
    const yDistance: number = Math.abs(y1 - y0);
    const xSlope: number = (x0 < x1) ? 1 : -1;
    const ySlope: number = (y0 < y1) ? 1 : -1;
    let err: number = xDistance - yDistance;
    
    while(true) {
       lineCoords.push([x0, y0]);
       if ((x0 === x1) && (y0 === y1)) break;
       let e2: number = 2 * err;
       if (e2 > -yDistance) { err -= yDistance; x0  += xSlope; }
       if (e2 < xDistance) { err += xDistance; y0  += ySlope; }
    }

    return lineCoords;
}


export function getAoeLineIndices(board: GameBoard, startIndex: number, endIndex: number): number[] {
    const startCoord: Coord = indexToCoord(startIndex, board.gridWidth);
    const endCoord: Coord = indexToCoord(endIndex, board.gridWidth);
    const lineCoords: Coord[] = getLine(startCoord[0], startCoord[1], endCoord[0], endCoord[1]);
    const lineIndices: number[] = lineCoords.map(coord => {return coordToIndex(coord, board.gridWidth)});
    return lineIndices.filter(i => i !== startIndex);
}

export function getBurstIndices(board: GameBoard, targetIndex: number, action: Action): number[] {
    if(action.burstRadius && action.burstRadius > 0) {
        return [targetIndex, ...getInRangeIndices(board, targetIndex, action.burstRadius)]
    } else {return [targetIndex]}
}

