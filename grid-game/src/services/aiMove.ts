import { GameBoard, GameChar, Action } from "../types/types";
import { TargetingType } from "../types/enums";
import { RangeType, Coord } from "../types/uiTypes";

import { 
    indexToCoord, coordToIndex, getAdjacentCoords, getInRangeIndices, distance 
} from '../services/ranger';
import { findBestBurstPlacement } from './aiAct';
import { getLos } from "./los";

//for a given action, provides the position the action should be cast from in order to hit the target
//remainingMvt should not matter; this only provides the final destination
export function getInRangeDest(
    board: GameBoard, mover: GameChar, action: Action, targetIndex: number, adjMatrix: number[][]
): number | null {
    const moverPosition: number = mover.game.positionIndex;
    const isBurst: boolean = action.target === TargetingType.burst;
    let castAtIndex: number = targetIndex;
    
    if(isBurst) {
        const burstCastAtIndex: number | null = findBestBurstPlacement(
            board, action, mover.game.gameId, targetIndex, adjMatrix);
        if(burstCastAtIndex) {
            castAtIndex = burstCastAtIndex
        } else {return null}
    }

    if(isBurst && action.range === 0) return castAtIndex;

    const alreadyInRange: boolean = distance(moverPosition, castAtIndex, board.gridWidth) <= action.range;
    const hasLos: boolean = getLos(board, [moverPosition]).includes(castAtIndex);

    if(alreadyInRange && hasLos) return moverPosition;

    const targetInRangeIndices: number[] = getInRangeIndices(board, castAtIndex, action.range, RangeType.mvt)
        .filter(index => {return adjMatrix[index].length > 0});
    //filter targetInRangeIndices to those with highest distance from target, to help performance...

    if(!targetInRangeIndices.length) {console.log('no in-range indices...'); return null;}
    if(targetInRangeIndices.includes(moverPosition)) return moverPosition;

    let shortestPath: number[] = [];

    for (let i = 0; i < targetInRangeIndices.length; i++) {
        const thisPath = pathfinder(board, moverPosition, targetInRangeIndices[i], adjMatrix);
        if(thisPath.length) {
            if(i === 0) shortestPath = thisPath;
            if(thisPath.length < shortestPath.length) shortestPath = thisPath;
        }
    }
    
    return shortestPath[shortestPath.length - 1];
}

//what if there is no path to dest?
export function moveTowardsDest( //returns next position in incremental move towards dest 
    board: GameBoard, mover: GameChar, destIndex: number, adjMatrix: number[][]
): number {
    const remainingMvt: number = getRemainingMvt(mover);

    if(remainingMvt === 0) return mover.game.positionIndex;

    const startIndex: number = mover.game.positionIndex;
    const path: number[] = pathfinder(board, startIndex, destIndex, adjMatrix);
    const mvtRangeIndices: number[] = getInRangeIndices(board, startIndex, remainingMvt, RangeType.mvt);
    const pathIndicesInRange: number[] = path.filter(index => mvtRangeIndices.includes(index));

    const sortedByDistanceDescending: number[] = pathIndicesInRange.sort((a,b) => 
        distance(startIndex, b, board.gridWidth) - distance(startIndex, a, board.gridWidth)
    );

    return sortedByDistanceDescending[0];
}

export function randomMoveToIndex(board: GameBoard, mover: GameChar): number {
    const mvtRangeIndices: number[] = getInRangeIndices(
        board, mover.game.positionIndex, getRemainingMvt(mover), RangeType.mvt);

    if(!mvtRangeIndices.length) return mover.game.positionIndex;

    const randomIndex: number = Math.floor(Math.random() * mvtRangeIndices.length);
    return mvtRangeIndices[randomIndex];
}

export function pathfinder(
    board: GameBoard, startIndex: number, endIndex: number, adjMatrix: number[][]
): number[] {
    if(startIndex === endIndex) return [];

    let queue: number[] = [startIndex];
    const visited: boolean[] = Array(board.gridWidth * board.gridHeight).fill(false);
    const previousIndices: number[] = Array(board.gridWidth * board.gridHeight).fill(null);
    let path: number[] = [];

    while(queue.length > 0) {
        const thisIndex: number = queue[0];
        const adjIndices: number[] = adjMatrix[thisIndex];
        for (let i = 0; i < adjIndices.length; i++) {
            if(!visited[adjIndices[i]]) {
                queue.push(adjIndices[i]);
                visited[adjIndices[i]] = true;
                previousIndices[adjIndices[i]] = thisIndex;
            }
        }
        queue = queue.slice(1);
    }

    for (let at = endIndex; at !== null; at = previousIndices[at]) path.push(at);

    path = reverseArray(path);

    return (path.length > 1 && path[path.length - 1] === endIndex) ? path : [];
    //path will include startIndex and endIndex!
}

export function newExploreDestination(board: GameBoard, currentPosition: number): number {
    const currentCoord: Coord = indexToCoord(currentPosition, board.gridWidth);
    const thirdOfWidth: number = Math.floor(board.gridWidth / 3);
    const thirdOfHeight: number = Math.floor(board.gridHeight / 3);
    const quadrantRow: number = Math.floor(currentCoord[0] / thirdOfHeight);
    const quadrantCol: number = Math.floor(currentCoord[1] / thirdOfWidth);

    const currentQuadrant: Coord = [
        quadrantRow <= 2 ? quadrantRow : 2,
        quadrantCol <= 2 ? quadrantCol : 2
    ];

    const newQuadrant: Coord = getNewQuadrant(currentQuadrant);
    const allCoords: Coord[] = getAllCoordsInQuadrant(newQuadrant, thirdOfWidth, thirdOfHeight);

    const allIndices: number[] = allCoords.map(coord => coordToIndex(coord, board.gridWidth));
    const cantMoveToIndices: number[] = getCantMoveToIndices(board);

    const canMoveToIndices: number[] = allIndices.filter(
        index => {return !cantMoveToIndices.includes(index)});
    
    const randomIndex: number = Math.floor(Math.random() * canMoveToIndices.length);
    return canMoveToIndices[randomIndex];
}

export function getAdjacencyMatrix(board: GameBoard): number[][] {
    const matrix: number[][] = [];
    const indexLength: number = board.gridWidth * board.gridHeight;
    const blockedIndices: number[] = getCantMoveToIndices(board);

    for (let i = 0; i < indexLength; i++) {
        const thisCoord: Coord = indexToCoord(i, board.gridWidth);
        const adjCoords: Coord[] = getAdjacentCoords(thisCoord, board.gridWidth, board.gridHeight);
        let adjIndices: number[] = adjCoords.map(coord => coordToIndex(coord, board.gridWidth));

        adjIndices = adjIndices.filter(index => {
            return !blockedIndices.includes(index) && index > 0 && index < indexLength
        });

        matrix[i] = adjIndices;
    }

    return matrix;
}

export function getCantMoveToIndices(board: GameBoard): number[] {
    const cantMoveToIndices: number[] = [
        ...board.walls,
        ...board.doors.map(d => d.position),
        ...board.chars.map(char => char.game.positionIndex)
    ];

    if(board.portal) cantMoveToIndices.push(board.portal);

    return cantMoveToIndices;
}

function reverseArray(array: any[]): any[] {
    const newArray = [];
    for (let i = array.length - 1; i >= 0; i--) newArray.push(array[i]);
    return newArray;
}

function getAllCoordsInQuadrant(quadrant: Coord, thirdOfWidth: number, thirdOfHeight: number) {
    const coords: Coord[] = [];
    const rowStart: number = quadrant[0] * thirdOfHeight;
    const rowEnd: number = rowStart + thirdOfHeight;
    const colStart: number = quadrant[1] * thirdOfWidth;
    const colEnd: number = colStart + thirdOfWidth;
    for (let row = rowStart; row <= rowEnd; row++) {
        for (let col = colStart; col <= colEnd; col++) coords.push([row,col])
    }
    return coords;
}

function getNewQuadrant(currentQuadrant: Coord): Coord {
    const positionString: string = currentQuadrant.join('');
    switch(positionString) {
        case '00': return [2,1];
        case '01': return [2,0];
        case '02': return [1,0];
        case '10': return [2,2];
        case '11': return randomEdgeQuadrant();
        case '12': return [0,0];
        case '20': return [1,2];
        case '21': return [0,2];
        case '22': return [0,1];
        default: console.log('no case found...'); return randomEdgeQuadrant();
    }
}

function randomEdgeQuadrant(): Coord {
    let newCoord: Coord = [1, 1];
    while(newCoord[0] === 1 && newCoord[1] === 1) {
      newCoord = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)]
    }
    return newCoord;
}

export function getRemainingMvt(char: GameChar): number {
    return char.game.stats.mvt - char.game.round.movementTaken
}

