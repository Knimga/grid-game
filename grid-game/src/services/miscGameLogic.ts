import { getInRangeIndices } from "./ranger";
import { rand } from "./roller";
import { hotTick, dotTick, applyStatEffect } from "./actions";
import { dmgDoneAndTaken, healingDone } from './meters';

import { GameChar, GameBoard, ActiveEffect } from "../types/types";
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
            chars[i].game.activeEffects = [];
            chars[i].game.positionIndex = rezSpawnIndex(board);
        }
    }
    return chars;
}

function rezSpawnIndex(board: GameBoard): number {
    const playerPositions: number[] = board.chars.filter(c => c.type === CharType.player && !isDead(c))
        .map(c => c.game.positionIndex);
    console.log(`living player positions: ${playerPositions}`);
    const adjIndices: number[] = getInRangeIndices(board, playerPositions[0], 1, RangeType.mvt);
    const randIndex: number = rand(adjIndices.length) - 1;
    return adjIndices[randIndex];
}

export function setNewRound(oldChars: GameChar[]): GameChar[] {
    let newChars: GameChar[] = [...oldChars];
    const whoDied: string[] = [];

    for (let c = 0; c < newChars.length; c++) {
        let char: GameChar = newChars[c];
        char.game.round.actionTaken = false;
        char.game.round.movementTaken = 0;

        if(char.game.stats.hp > 0) {
            char.game.stats.hp += char.game.stats.hpRegen;
            char.game.stats.mp += char.game.stats.mpRegen;      
    
            const activeEffects: ActiveEffect[] = char.game.activeEffects;
    
            for (let e = 0; e < activeEffects.length; e++) {
                activeEffects[e].durationElapsed++;
    
                if(activeEffects[e].type === 'hot') {
                    const castByChar: GameChar | undefined = newChars.find(char => char.game.gameId === activeEffects[e].castById);
                    if(castByChar) {
                        const effectiveHealingTick: number = hotTick(castByChar, activeEffects[e]).amount;
                        const bonusHealingTick: number = Math.floor(char.game.stats.bonusHealingRcvd / activeEffects[e].duration);
                        const totalTick: number = effectiveHealingTick + bonusHealingTick;
                        if(activeEffects[e].targetStat === 'hp') char.game.stats.hp += totalTick;
                        if(activeEffects[e].targetStat === 'mp') char.game.stats.mp += totalTick;
                        newChars = healingDone(newChars, activeEffects[e].castById, effectiveHealingTick);
                    }
                } else if(activeEffects[e].type === 'dot') {
                    const castByChar: GameChar | undefined = newChars.find(
                        char => char.game.gameId === activeEffects[e].castById
                    );

                    if(castByChar) {
                        let damageTick: number = dotTick(castByChar, newChars[c], activeEffects[e]);
                        if(activeEffects[e].targetStat === 'hp') char.game.stats.hp -= damageTick;
                        if(activeEffects[e].targetStat === 'mp') char.game.stats.mp -= damageTick;
                        if(char.game.stats.hp === 0) whoDied.push(char.name);
                        newChars = dmgDoneAndTaken(
                            newChars, activeEffects[e].castById, newChars[c].game.gameId, 
                            damageTick, activeEffects[e].targetStat
                        );
                    }
                }
            }
    
            const expiredEffects: ActiveEffect[] = char.game.activeEffects.filter(
                effect => effect.durationElapsed === effect.duration
            );
    
            for (let i = 0; i < expiredEffects.length; i++) {
                if(['buff','debuff'].includes(expiredEffects[i].type)) {
                    char = applyStatEffect(
                        char, expiredEffects[i].targetStat, -expiredEffects[i].effectiveAmount
                    )
                }
                const removeAtIndex: number = char.game.activeEffects.indexOf(expiredEffects[i]);
                char.game.activeEffects.splice(removeAtIndex, 1);
            }
    
            if(char.game.stats.hp > char.stats.hp) char.game.stats.hp = char.stats.hp;
            if(char.game.stats.mp > char.stats.mp) char.game.stats.mp = char.stats.mp;
        }

    }

    return newChars;
}