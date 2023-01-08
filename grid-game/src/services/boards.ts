import { distance, getSpawnArea } from './ranger';
import { randId } from './detailStrings';

import {GameSquare, EditorSquare, TerrainType, Style, DoorToBoardMap} from '../uiTypes';
import {GameBoard, Dungeon, Board, Door, DoorName} from '../types';

interface BoardStyles {
    square: Style,
    board: Style
}

const staticBoardSize: Style = {width: 900, height: 900};

export function getBoardStyles(board: Board | GameBoard, customBoardSize?: Style): BoardStyles {
    let squareSize: number;
    
    if(customBoardSize) {
        squareSize = getSquareSize(board.gridWidth, board.gridHeight, customBoardSize)
    } else {
        squareSize = getSquareSize(board.gridWidth, board.gridHeight)
    }

    return {
        square: {width: squareSize, height: squareSize},
        board: {
            width: board.gridWidth * squareSize, 
            height: board.gridHeight * squareSize
        }
    }
}

export function createEditorGrid(board: Board): EditorSquare[]  {
    const grid: EditorSquare[] = [];
    const gridLength: number = board.gridWidth * board.gridHeight;

    for (let i = 0; i < gridLength; i++) grid[i] = {type: TerrainType.floor};
    for (let w = 0; w < board.walls.length; w++) grid[board.walls[w]] = {type: TerrainType.wall};
    for (let c = 0; c < board.chars.length; c++) {
        if(board.chars[c].index > -1) grid[board.chars[c].index].char = board.chars[c]
    }

    return grid;
}

export function createGameGrid(board: GameBoard): GameSquare[] {
    const grid: GameSquare[] = [];
    const gridLength: number = board.gridWidth * board.gridHeight;

    for (let i = 0; i < gridLength; i++) grid[i] = {type: TerrainType.floor}
    for (let w = 0; w < board.walls.length; w++) grid[board.walls[w]] = {type: TerrainType.wall}
    for (let c = 0; c < board.chars.length; c++) {
        if(board.chars[c].game.positionIndex > -1) {
            grid[board.chars[c].game.positionIndex].char = board.chars[c]
        }
    }

    return grid;
}

function getSquareSize(gridWidth: number, gridHeight: number, customBoardSize?: Style): number {
    const boardSize: Style = customBoardSize ?? staticBoardSize;
    const heightDivided: number = boardSize.height / gridHeight;
    const widthDivided: number = boardSize.width / gridWidth;
    return heightDivided <= widthDivided ? heightDivided : widthDivided;
}

export function getSpawningIndices(board: GameBoard, spawnLocation: number, partySize: number): number[] {
    const charPositions: number[] = board.chars.map(char => char.game.positionIndex);
    const spawningArea: number[] = getSpawnArea(board, spawnLocation, charPositions);
    const sortedByClosest: number[] = spawningArea.sort((a,b) => 
        distance(spawnLocation, a, board.gridWidth) > distance(spawnLocation, b, board.gridWidth) ? 1 : -1
    );
    return sortedByClosest.slice(0, partySize);
}

export function blankBoard(width: number, height: number) {
    return {
        id: randId(),
        name: 'Blank board',
        gridWidth: width,
        gridHeight: height,
        doors: [],
        walls: [],
        chars: []
    }
}

export function blankEditorBoard(): Board {return blankBoard(15,15)}
export function blankGameBoard(): GameBoard {return blankBoard(15,15)}

export function newDoor(dungeonName: string, boardName: string, position: number): Door {
    return {
        id: randId(),
        name: [doorNameFormat(dungeonName), doorNameFormat(boardName), "newdoor"],
        position: position,
        leadsTo: {boardId: '', doorId: ''}
    }
}

export function doorNameString(doorName: DoorName): string {
    return `${doorName[0]}-${doorName[1]}-${doorName[2]}`
}

export function doorNameFormat(str: string): string {return str.replaceAll(' ', '').toLowerCase()}

export function doorToBoardMap(dungeon: Dungeon): DoorToBoardMap[] {
    const doorsByBoard: DoorToBoardMap[][] = dungeon.boards.map((board, bIndex) => {
        return board.doors.map((door, dIndex) => {
            return {
                boardId: board.id, 
                doorId: door.id,
                boardIndex: bIndex,
                doorIndex: dIndex
            }
        })
    });
    return doorsByBoard.flat(1);
}
