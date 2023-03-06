import { getInRangeIndices } from "./ranger";
import { rand } from "./roller";
import { hotTick, dotTick } from "./actions";
import { applyAttrEffect, applyStatEffect, never0, neverNegative } from "./charCalc";
import { dmgDoneAndTaken, healingDone } from './meters';

import { GameChar, GameBoard, ActiveEffect } from "../types/types";
import { CharType, EffectType } from "../types/enums";
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

//break this down into more functions
export function setNewRound(oldChars: GameChar[]): GameChar[] {
    let newChars: GameChar[] = [...oldChars];
    const whoDied: string[] = [];

    for (let c = 0; c < newChars.length; c++) {
        let char: GameChar = newChars[c];
        if(isDead(char)) continue;
        
        char.game.round.actionTaken = false;
        char.game.round.movementTaken = 0;
        char.game.stats.hp += char.game.stats.hpRegen;
        char.game.stats.mp += char.game.stats.mpRegen;   

        const activeEffects: ActiveEffect[] = char.game.activeEffects;

        for (let e = 0; e < activeEffects.length; e++) {
            activeEffects[e].durationElapsed++;

            if(activeEffects[e].type === EffectType.hot) {
                const hotTickResults = applyHotTick(char, activeEffects[e], newChars);
                char = hotTickResults.newTargetChar;
                newChars = healingDone(newChars, activeEffects[e].castById, 
                    hotTickResults.effectiveHealingDone);

                /*
                const castByChar: GameChar | undefined = newChars.find(char => 
                    char.game.gameId === activeEffects[e].castById);
                if(castByChar) {
                    const effectiveHealingTick: number = hotTick(
                        castByChar, activeEffects[e], char.game.stats.bonusHealingRcvd, 
                        activeEffects[e].durationElapsed).amount;

                    if(activeEffects[e].targetStat === 'hp') char.game.stats.hp += effectiveHealingTick;
                    if(activeEffects[e].targetStat === 'mp') char.game.stats.mp += effectiveHealingTick;
                    newChars = healingDone(newChars, activeEffects[e].castById, effectiveHealingTick);
                }
                */
            } 
            
            if(activeEffects[e].type === EffectType.dot) {
                const dotTickResults = applyDotTick(char, activeEffects[e], newChars);
                char = dotTickResults.newTargetChar;
                newChars = dmgDoneAndTaken(
                    newChars, activeEffects[e].castById, newChars[c].game.gameId, 
                    dotTickResults.effectiveDmgDone, activeEffects[e].targetStat
                );
                if(char.game.stats.hp === 0) whoDied.push(char.name);

                /*const castByChar: GameChar | undefined = newChars.find(
                    char => char.game.gameId === activeEffects[e].castById);

                if(castByChar) {
                    let damageTick: number = dotTick(castByChar, newChars[c], activeEffects[e], 
                        activeEffects[e].durationElapsed);
                    if(activeEffects[e].targetStat === 'hp') char.game.stats.hp -= damageTick;
                    if(activeEffects[e].targetStat === 'mp') char.game.stats.mp -= damageTick;
                    if(char.game.stats.hp === 0) whoDied.push(char.name);
                    newChars = dmgDoneAndTaken(
                        newChars, activeEffects[e].castById, newChars[c].game.gameId, 
                        damageTick, activeEffects[e].targetStat
                    );
                }
                */
            }
        }

        char = removeExpiredEffects(char);

        /*const expiredEffects: ActiveEffect[] = char.game.activeEffects.filter(
            effect => effect.durationElapsed === effect.duration
        );

        for (let i = 0; i < expiredEffects.length; i++) {
            if(['buff','debuff'].includes(expiredEffects[i].type)) {
                switch(expiredEffects[i].targetStat) {
                    case 'strength': char = applyAttrEffect(char, 'strength', -expiredEffects[i].effectiveAmount);
                        break;
                    case 'finesse': char = applyAttrEffect(char, 'finesse', -expiredEffects[i].effectiveAmount);
                        break;
                    case 'toughness': char = applyAttrEffect(char, 'toughness', -expiredEffects[i].effectiveAmount);
                        break;
                    case 'mind': char = applyAttrEffect(char, 'mind', -expiredEffects[i].effectiveAmount);
                        break;
                    case 'spirit': char = applyAttrEffect(char, 'spirit', -expiredEffects[i].effectiveAmount);
                        break;
                    default: char.game.stats = applyStatEffect(char.game.stats, expiredEffects[i].targetStat, -expiredEffects[i].effectiveAmount)
                }
            }

            const removeAtIndex: number = char.game.activeEffects.indexOf(expiredEffects[i]);
            char.game.activeEffects.splice(removeAtIndex, 1);
        }*/

        if(char.game.stats.hp > char.stats.hp) char.game.stats.hp = char.stats.hp;
        if(char.game.stats.mp > char.stats.mp) char.game.stats.mp = char.stats.mp;
        
    }

    return newChars;
}

function applyHotTick(
    target: GameChar, activeEffect: ActiveEffect, chars: GameChar[]
): {newTargetChar: GameChar, effectiveHealingDone: number} {
    if(activeEffect.type !== EffectType.hot) return {newTargetChar: target, effectiveHealingDone: 0};

    const castByChar: GameChar | undefined = chars.find(char => 
        char.game.gameId === activeEffect.castById);

    if(!castByChar) return {newTargetChar: target, effectiveHealingDone: 0};

    const effectiveHealingTick: number = hotTick(castByChar, activeEffect, 
        target.game.stats.bonusHealingRcvd, activeEffect.durationElapsed)
        .amount;

    if(activeEffect.targetStat === 'hp') target.game.stats.hp += effectiveHealingTick;
    if(activeEffect.targetStat === 'mp') target.game.stats.mp += effectiveHealingTick;

    return {newTargetChar: target, effectiveHealingDone: effectiveHealingTick}
}

function applyDotTick(
    target: GameChar, activeEffect: ActiveEffect, chars: GameChar[]
): {newTargetChar: GameChar, effectiveDmgDone: number} {
    if(activeEffect.type !== EffectType.dot) return {newTargetChar: target, effectiveDmgDone: 0};

    const castByChar: GameChar | undefined = chars.find(char => 
        char.game.gameId === activeEffect.castById);

    if(!castByChar) return {newTargetChar: target, effectiveDmgDone: 0};

    let damageTick: number = dotTick(castByChar, target, activeEffect, 
        activeEffect.durationElapsed);

    if(activeEffect.targetStat === 'hp') {
        target.game.stats.hp = neverNegative(target.game.stats.hp - damageTick)
    }
    if(activeEffect.targetStat === 'mp') {
        target.game.stats.hp = neverNegative(target.game.stats.mp - damageTick)
    }

    return {newTargetChar: target, effectiveDmgDone: damageTick}
}

function removeExpiredEffects(char: GameChar): GameChar {
    const expiredEffects: ActiveEffect[] = char.game.activeEffects.filter(
        effect => effect.durationElapsed === effect.duration
    );

    for (let i = 0; i < expiredEffects.length; i++) {
        if(['buff','debuff'].includes(expiredEffects[i].type)) {
            const effectAmount: number = expiredEffects[i].effectiveAmount;
            switch(expiredEffects[i].targetStat) {
                case 'strength': char = applyAttrEffect(char, 'strength', -effectAmount);
                    break;
                case 'finesse': char = applyAttrEffect(char, 'finesse', -effectAmount);
                    break;
                case 'toughness': char = applyAttrEffect(char, 'toughness', -effectAmount);
                    break;
                case 'mind': char = applyAttrEffect(char, 'mind', -effectAmount);
                    break;
                case 'spirit': char = applyAttrEffect(char, 'spirit', -effectAmount);
                    break;
                default: char.game.stats = applyStatEffect(char.game.stats, 
                    expiredEffects[i].targetStat, -effectAmount);
            }
        }

        const removeAtIndex: number = char.game.activeEffects.indexOf(expiredEffects[i]);
        char.game.activeEffects.splice(removeAtIndex, 1);
    }

    return char;
}