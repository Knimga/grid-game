import {GameSquare, EditorSquare, TerrainType, Style} from '../uiTypes';
import {GameBoard, Board} from '../types';
import { distance, getSpawnArea } from './ranger';

interface BoardStyles {
    square: Style,
    board: Style
}

const boardSize: Style = {width: 900, height: 900};

export function getBoardStyles(board: Board | GameBoard): BoardStyles {
    const squareSize: number = getSquareSize(board.gridWidth, board.gridHeight);
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

function getSquareSize(gridWidth: number, gridHeight: number): number {
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