import { getInRangeIndices } from "./ranger";
import { rand } from "./roller";

import { GameChar, GameBoard } from "../types/types";
import { CharType } from "../types/enums";
import { RangeType } from "../types/uiTypes";

export function isDead(char: GameChar): boolean {return char.game.stats.hp <= 0}

export function countChars(board: GameBoard, countPlayers: boolean): number {
    const charTypes: CharType[] = countPlayers ? [CharType.player] : [CharType.enemy, CharType.beast];
    return board.chars.filter(char => charTypes.includes(char.type) && !isDead(char)).length
}

export function rezDeadPlayers(chars: GameChar[], board: GameBoard): GameChar[] {
    for (let i = 0; i < chars.length; i++) {
        if(chars[i].type === CharType.player && isDead(chars[i])) {
            chars[i].game.stats.hp = Math.floor(chars[i].stats.hp * 0.15);
            chars[i].game.stats.mp = Math.floor(chars[i].stats.mp * 0.15);
            chars[i].game.positionIndex = rezSpawnIndex(board);
        }
    }
    return chars;
}

function rezSpawnIndex(board: GameBoard): number {
    const playerPositions: number[] = board.chars.filter(c => c.type === CharType.player && !isDead(c))
        .map(c => c.game.positionIndex);
    const adjIndices: number[] = getInRangeIndices(board, playerPositions[0], 1, RangeType.mvt);
    const randIndex: number = rand(adjIndices.length) - 1;
    return adjIndices[randIndex];
}