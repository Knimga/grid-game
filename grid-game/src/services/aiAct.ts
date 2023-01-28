import { GameBoard, GameChar, Action } from "../types/types";
import { CharType, EffectType, ClassRole, Intent, DamageType } from '../types/enums';
import { getInRangeIndices } from "./ranger";
import { isDead } from "./miscGameLogic";
import { effectAlreadyApplied } from "./actions";

export function canHeal(char: GameChar): boolean {
    const healingSpells: Action[] = char.actions.filter(
        action => action.effects.some(effect => effect.type === 'healing' || effect.type === 'hot'));
    return healingSpells.length > 0 && healingSpells.some(spell => char.game.stats.mp >= spell.mpCost);
}

export function hasBuff(char: GameChar): boolean {
    return char.actions.some(action => action.effects.some(effect => effect.type === 'buff'))
}

export function whoNeedsHealing(board: GameBoard): GameChar[] {
    const lowHealthEnemies: GameChar[] = board.chars.filter(char => {
        return char.type === 'enemy' && !isDead(char) && char.game.stats.hp / char.stats.hp <= 0.6
    });
    return lowHealthEnemies.sort((a,b) => a.game.stats.hp - b.game.stats.hp);
}

export function shouldHealSelf(healer: GameChar, needsHealing: GameChar[]): boolean {
    const self: GameChar | undefined = needsHealing.find(c => c.game.gameId === healer.game.gameId);
    if(!self) return false;
    const highestHpValue: number = Math.max(...needsHealing.map(c => c.game.stats.hp));
    return self.game.stats.hp / highestHpValue <= 0.4;
}

export function canBuffSelf(buffer: GameChar, buffAction: Action): boolean {
    return !effectAlreadyApplied(buffer.game.activeEffects, buffer.game.gameId, buffAction.name)
}

export function getHealingActions(char: GameChar): Action[] {
    const heals: Action[] = char.actions.filter(a => 
        a.effects.some(e => e.type === EffectType.healing || e.type === EffectType.hot));
    return randomSort(heals);
}

export function sortToPreferStrongHeals(actions: Action[]): Action[] {
    const healType: Action[] = actions.filter(a => a.effects.some(e => e.type === EffectType.healing));
    const hotType: Action[] = actions.filter(a => a.effects.some(e => e.type === EffectType.hot));
    return [...randomSort(healType), ...randomSort(hotType)];
}

export function decidesToBuff(actor: GameChar): boolean {
    if(!hasBuff(actor)) return false;
    const chanceToCastBuff: number = actor.class.role === ClassRole.support ? 0.2 : 0.1;
    const notLowOnMp: boolean = actor.game.stats.mp / actor.stats.mp > 0.4;
    return notLowOnMp && Math.random() <= chanceToCastBuff;
}

export function randomSortedBuffActions(char: GameChar): Action[] {
    const buffActions: Action[] = char.actions.filter(a => a.effects.some(e => e.type === EffectType.buff));
    return randomSort(buffActions);
}

export function sortedOffenseActions(actor: GameChar): Action[] {
    const castableOffensiveActions: Action[] = actor.actions.filter(
        a => a.intent === Intent.offense && a.mpCost <= actor.game.stats.mp);
    switch(actor.class.role) {
        case ClassRole.melee: return meleeActionSort(castableOffensiveActions);
        case ClassRole.ranged: return rangedActionSort(castableOffensiveActions);
        case ClassRole.magic: return magicActionSort(castableOffensiveActions);
        case ClassRole.support: return randomSort(castableOffensiveActions);
        default: return castableOffensiveActions;
    }
}

export function randomSort(items: any[]): any[] {return items.sort((a, b) => 0.5 - Math.random())}

export function meleeActionSort(actions: Action[]): Action[] {
    return actions.sort((a,b) => {
        const preferenceMod: number = a.isWeapon ? 0.25 : 0;
        return 0.5 - (Math.random() + preferenceMod)
    })
}

export function magicActionSort(actions: Action[]): Action[] {
    return actions.sort((a,b) => {
        const preferenceMod: number = !a.isWeapon ? 0.25 : 0;
        return 0.5 - (Math.random() + preferenceMod)
    })
}

function rangedActionSort(actions: Action[]): Action[] {
    return actions.sort((a,b) => {
        const preferenceMod: number = a.dmgType === DamageType.ranged ? 0.25 : 0;
        return 0.5 - (Math.random() + preferenceMod)
    })
}

export function findBestBurstPlacement(
    board: GameBoard, action: Action, casterGameId: string, targetCharIndex: number, adjMatrix: number[][]
): number | null {
    if(!action.burstRadius) {console.log('not a burst action!'); return null;}
     //this can return indices with no adjIndices! This can return indices with chars on them!
    const playerIndices: number[] = board.chars.filter(char => char.type === CharType.player)
        .map(char => char.game.positionIndex);
    let indicesWhereBurstHitsTarget: number[] = getInRangeIndices(board, targetCharIndex, action.burstRadius);
    
    if(action.range === 0) {
        const otherCharIndices: number[] = board.chars.filter(char => char.game.gameId !== casterGameId)
            .map(char => char.game.positionIndex);
        indicesWhereBurstHitsTarget = indicesWhereBurstHitsTarget.filter(index => !otherCharIndices.includes(index));
        if(!indicesWhereBurstHitsTarget.length) {console.log("can't hit target with 0-range burst!"); return null;}
    }

    let burstPlacements: {targetIndex: number, burstIndices: number[]}[] = [];

    for (let i = 0; i < indicesWhereBurstHitsTarget.length; i++) {
        const thisIndex: number = indicesWhereBurstHitsTarget[i];
        let inRangeIndices: number[] = getInRangeIndices(board, thisIndex, action.burstRadius);

        if(action.range === 0) inRangeIndices = inRangeIndices.filter(index => adjMatrix[index].length > 0);

        if(inRangeIndices.length > 0) {
            burstPlacements.push({
                targetIndex:  thisIndex,
                burstIndices: [thisIndex, ...getInRangeIndices(board, thisIndex, action.burstRadius)]
            })
        }
    }

    if(!burstPlacements.length) return null;

    //the below line is not necessary? burstPlacements already based on indicesWhereBurstHitsTarget
    //burstPlacements = burstPlacements.filter(placement => placement.burstIndices.includes(targetCharIndex));

    const countOfPlayers: number[] = burstPlacements.map(placement => {
        return placement.burstIndices.filter(index => playerIndices.includes(index)).length
    });
    const maxPlayersIndex: number = countOfPlayers.indexOf(Math.max(...countOfPlayers));

    return burstPlacements[maxPlayersIndex].targetIndex;
}