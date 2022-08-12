
import { GameBoard, GameChar, CharType } from "../types";
import { RangeType } from "../uiTypes";
import { getInRangeIndices } from "./ranger";

export function getLos(board: GameBoard, fromPositions: number[]): number[] {
    const losIndices: number[] = [];
    for (let i = 0; i < fromPositions.length; i++) {
        const los: number[] = getInRangeIndices(board, fromPositions[i], 25, RangeType.los);
        for (let l = 0; l < los.length; l++) if(!losIndices.includes(los[l])) losIndices.push(los[l]);
    }
    return losIndices;
}

export function visiblePlayers(chars: GameChar[]): number[] {
    return chars.filter(char => char.type === 'player' && char.game.isVisible)
        .map(char => char.game.positionIndex)
}

export function canSeePlayers(board: GameBoard, fromPosition: number): boolean {
    const playerPositions: number[] = board.chars.filter(char => char.type === 'player')
        .map(char => char.game.positionIndex);
    const los: number[] = getLos(board, [fromPosition]);
    return los.some(i => playerPositions.includes(i));
}

export function setVisibility(board: GameBoard): GameChar[] {
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
        newChars[i].game.isVisible = visibleIds.includes(newChars[i].game.gameId) ? true : false
    }
    
    return newChars;
}
