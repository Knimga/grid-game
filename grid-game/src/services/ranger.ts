import { getCantMoveToIndices } from './aiMove';

import {GameBoard, Board, Action} from '../types/types';
import {RangeType} from '../types/uiTypes';

type Coord = [number, number];

export function getInRangeIndices(
    gameBoard: GameBoard,
    position: number, 
    range: number,
    rangeType?: RangeType
): number[] {
    if(range === 0) return [position];

    let inRangeIndices: number[] = getSeenIndices(gameBoard, position, range);

    if(rangeType === RangeType.mvt) {
        const cantMoveTo: number[] = getCantMoveToIndices(gameBoard);
        inRangeIndices = inRangeIndices.filter(index => {return !cantMoveTo.includes(index)});
    }

    if(rangeType === RangeType.atk) inRangeIndices.splice(inRangeIndices.indexOf(position), 1);

    return inRangeIndices;
}

export function getSpawnArea(board: GameBoard | Board, startIndex: number, charPositions: number[]): number[] {
    return getSeenIndices(board, startIndex, 2)
        .filter(index => !charPositions.includes(index) && index !== startIndex)
}

export function getSeenIndices(board: GameBoard | Board, startIndex: number, range: number): number[] {
    const startCoord: Coord = indexToCoord(startIndex, board.gridWidth);
    const circleCoords: Coord[] = drawCircle(board, startCoord, range);
    const seenIndices: number[] = [];

    for (let i = 0; i < circleCoords.length; i++) {
        const lineCoords: Coord[] = getLine(startCoord[0], startCoord[1], circleCoords[i][0], circleCoords[i][1]);
        const lineIndices: number[] = lineCoords.map(coord => coordToIndex(coord, board.gridWidth));

        if(lineIndices.every(index => !board.walls.includes(index))) {
            seenIndices.push(coordToIndex(circleCoords[i], board.gridWidth))
        }
    }

    return seenIndices;
}

export function drawCircle(board: GameBoard | Board, centerCoord: Coord, radius: number): Coord[] {
    const startX: number = centerCoord[0], startY: number = centerCoord[1];
    const coords: Coord[] = [];

    for (let x = startX - radius; x <= startX + radius; x++) {
        for (let y = startY - radius; y <= startY + radius; y++) coords.push([x,y])
    }

    return coords.filter(coord => {
        const x = coord[0], y = coord[1];
        const index: number = coordToIndex(coord, board.gridWidth);
        const tests: boolean[] = [
            x >= 0, y >= 0, x <= board.gridHeight - 1, y <= board.gridWidth - 1, !board.walls.includes(index)
        ];
        return tests.every(t => t);
    });
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

export function getAdjacentIndices(index: number, gridWidth: number, gridHeight: number): number[] {
    const coord: Coord = indexToCoord(index, gridWidth);
    const adjCoords: Coord[] = getAdjacentCoords(coord, gridWidth, gridHeight);
    return adjCoords.map(c => coordToIndex(c, gridWidth));
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

