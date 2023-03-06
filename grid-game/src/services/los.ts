
import { GameBoard, GameChar } from "../types/types";
import { CharType } from "../types/enums";
import { RangeType } from "../types/uiTypes";
import { getInRangeIndices, getAdjacentIndices } from "./ranger";

export function getLos(board: GameBoard, fromPositions: number[]): number[] {
    const losIndices: number[] = [];
    for (let i = 0; i < fromPositions.length; i++) {
        const los: number[] = getInRangeIndices(board, fromPositions[i], 25, RangeType.los);
        for (let l = 0; l < los.length; l++) if(!losIndices.includes(los[l])) losIndices.push(los[l]);
    }
    return losIndices;
}

export function visiblePlayers(chars: GameChar[]): number[] {
    return chars.filter(char => char.type === CharType.player && char.game.isVisible)
        .map(char => char.game.positionIndex)
}

export function canSeePlayers(board: GameBoard, fromPosition: number): boolean {
    const playerPositions: number[] = board.chars.filter(char => char.type === CharType.player)
        .map(char => char.game.positionIndex);
    const los: number[] = getLos(board, [fromPosition]);
    return los.some(i => playerPositions.includes(i));
}

export function setCharVisibility(board: GameBoard, pregameSetup?: boolean): GameChar[] {
    const enemies: GameChar[] = board.chars.filter(char => char.type !== CharType.player && char.game.positionIndex > -1);
    const players: GameChar[] = board.chars.filter(char => char.type === CharType.player && char.game.positionIndex > -1);
    const enemyPositions: number[] = enemies.map(char => char.game.positionIndex);
    const playerPositions: number[] = players.map(char => char.game.positionIndex);
    const enemyLos: number[] = getLos(board, enemyPositions);
    const playerLos: number[] = getLos(board, playerPositions);

    const visibleEnemies: GameChar[] = enemies.filter(char => playerLos.includes(char.game.positionIndex));
    const visiblePlayers: GameChar[] = players.filter(char => enemyLos.includes(char.game.positionIndex));
    
    const visibleIds: string [] = [
        ...visibleEnemies.map(char => char.game.gameId),
        ...visiblePlayers.map(char => char.game.gameId)
    ];

    const newChars = [...board.chars];
    for (let i = 0; i < newChars.length; i++) {
        newChars[i].game.isVisible = visibleIds.includes(newChars[i].game.gameId) ? true : false;
        if(pregameSetup) {
            newChars[i].game.hasBeenSeen = newChars[i].type === CharType.player ? 
                true : newChars[i].game.isVisible
        }
        if(!newChars[i].game.hasBeenSeen) newChars[i].game.hasBeenSeen = newChars[i].game.isVisible;
    }
    
    return newChars;
}

export function getPlayerLos(board: GameBoard): number[] {
    const players: GameChar[] = board.chars.filter(char => char.type === CharType.player && char.game.positionIndex > -1);
    const playerPositions: number[] = players.map(char => char.game.positionIndex);
    const playerLos: number[] = getLos(board, playerPositions);
    const edgeOfLos: number[] = [];

    for (let i = 0; i < playerLos.length; i++) {
        const adjIndices: number[] = getAdjacentIndices(playerLos[i], board.gridWidth, board.gridHeight);
        for (let a = 0; a < adjIndices.length; a++) {
            if(!playerLos.includes(adjIndices[a])) edgeOfLos.push(adjIndices[a])
        }
    }

    return [...playerLos, ...edgeOfLos.filter(i => board.walls.includes(i))];
}
