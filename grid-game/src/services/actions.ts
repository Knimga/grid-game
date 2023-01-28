import { rollDie, rollD20 } from './roller';

import { getAtkBonus, isElemental, getBonus } from './charCalc';
import { updateMeters } from './meters';

import { RollResult, GameChar, Action, ActionResult, Effect, ActiveEffect, Stats } from '../types/types';
import { EffectTargetStat, EffectType, CharType, Intent, DamageType, TargetingType } from '../types/enums';

export function applyActionResults(actor: GameChar, results: ActionResult[], oldChars: GameChar[]): GameChar[] {
    for (let r = 0; r < results.length; r++) {
        const thisChar: GameChar | undefined = oldChars.find(
            char => char.game.gameId === results[r].newTargetChar.game.gameId);
        if(thisChar) {
            const targetIndex: number = oldChars.indexOf(thisChar);
            oldChars[targetIndex] = results[r].newTargetChar;
            oldChars = updateMeters(results[r], oldChars, actor.game.gameId, oldChars[targetIndex].game.gameId);
        }
    }

    return oldChars;
}

export function resolveAction(actor: GameChar, targets: GameChar[], action: Action): ActionResult[] {
    const autoSuccess: boolean = getTargetTypes(action.intent, actor.type).includes(actor.type);

    const blankResults: ActionResult[] = targets.map(targetChar => blankActionResult(targetChar, action));

    if(autoSuccess) {
        blankResults.forEach(result => result.success = true)
    } else {
        const atkRoll: RollResult = rollD20(getAtkBonus(actor.game.stats, action.dmgType));

        for (let r = 0; r < blankResults.length; r++) {
            const targetAC: number = isElemental(action.dmgType) || action.dmgType === DamageType.magic ? 
            blankResults[r].newTargetChar.game.stats.mac : blankResults[r].newTargetChar.game.stats.ac;
            blankResults[r].atkRollResult = atkRoll;
            if(atkRoll.result > targetAC) blankResults[r].success = true;
        }
    }

    return applyEffects(actor, blankResults, action);
}

function applyEffects(actor: GameChar, results: ActionResult[], action: Action): ActionResult[] {
    const effects: Effect[] = action.effects.filter(e => !e.targetsSelf);
    const targetSelfEffects: Effect[] = action.effects.filter(e => e.targetsSelf);

    for (let r = 0; r < results.length; r++) {
        if(results[r].success) {
            for (let e = 0; e < effects.length; e++) { 
                if(effects[e].roll) results[r].dmgRollResult = rollDmgOrHealing(actor, action, effects[e]);
                results[r] = applyEffect(actor, results[r], action, effects[e]);
            }
        }
    }

    if(targetSelfEffects.length && !results.find(r => r.newTargetChar.game.gameId === actor.game.gameId)) {
        const selfResult: ActionResult = blankActionResult(actor, action);
        results.push(selfResult);
        const selfIndex: number = results.indexOf(selfResult);
        for (let e = 0; e < targetSelfEffects.length; e++) {
            results[selfIndex].dmgRollResult = rollDmgOrHealing(actor, action, targetSelfEffects[e]);
            results[selfIndex] = applyEffect(actor, results[selfIndex], action, targetSelfEffects[e]);
        }
    }

    return results;
}

function rollDmgOrHealing(actor: GameChar, action: Action, effect: Effect): RollResult | undefined {
    if(effect.roll) {
        const bonus: number = getBonus(actor.game.stats, effect, action.isWeapon, action.hands ?? 1);
        return rollDie({...effect.roll, mod: effect.roll.mod + bonus});
    } else {return undefined}
}

function applyEffect(actor: GameChar, result: ActionResult, action: Action, effect: Effect): ActionResult {
    switch(effect.type) {
        case EffectType.damage: return applyDamage(actor, result, effect, action.isWeapon, action.hands ?? 1);
        case EffectType.healing: return applyHeal(actor, result, effect);
        case EffectType.buff: return applyBuffOrDebuff(actor, result, effect);
        case EffectType.debuff: return applyBuffOrDebuff(actor, result, effect);
        case EffectType.hot: return applyHotOrDot(actor, result, effect);
        case EffectType.dot: return applyHotOrDot(actor, result, effect);
        case EffectType.threat: return applyThreatEffect(actor, result, effect);
        default: console.log('no effect valid type!'); return result;
    }
}

function applyDamage(
    attacker: GameChar, result: ActionResult, effect: Effect, isWeapon: boolean, hands: number
): ActionResult {
    const newResult: ActionResult = result;
    const getsMagicDr: boolean = !isWeapon && (isElemental(effect.dmgType) || effect.dmgType === DamageType.magic);
    const dmgBonus: number = getBonus(attacker.game.stats, effect, isWeapon ?? false, hands ?? 1);
    const hpMp: (keyof Stats) = effect.targetStat === EffectTargetStat.hp ? 'hp' : 'mp';

    let targetDr: number = result.newTargetChar.game.stats.dmgTypes[effect.dmgType].dr;
    let effectiveDamage: number = 0;

    if(getsMagicDr) targetDr += attacker.game.stats.dmgTypes.magic.dr;
    if(result.dmgRollResult) effectiveDamage = result.dmgRollResult.result - targetDr;
    if(effect.flatAmount !== undefined) effectiveDamage = effect.flatAmount + dmgBonus - targetDr;
    if(effectiveDamage < 1) effectiveDamage = 1;

    if(!result.dmgRollResult && effect.flatAmount === undefined) console.log('omg i cant do damage');

    if(newResult.newTargetChar.game.stats[hpMp] - effectiveDamage < 0) {
        effectiveDamage = newResult.newTargetChar.game.stats[hpMp];
        newResult.newTargetChar.game.stats[hpMp] = 0;
    } else {
        newResult.newTargetChar.game.stats[hpMp] -= effectiveDamage;
    }

    if(newResult.newTargetChar.game.stats.hp <= 0) newResult.charDiedThisTurn = true;

    newResult.totalDmgDone += effectiveDamage;
    newResult.effectResults.push({
        effectiveAmount: effectiveDamage, 
        effect: effect,
        castById: attacker.game.gameId
    });

    return newResult;
}

function applyHeal(caster: GameChar, result: ActionResult, effect: Effect): ActionResult {
    const newResult: ActionResult = result;
    const targetChar: GameChar = newResult.newTargetChar;
    const healingBonus: number = getBonus(caster.game.stats, effect, false, 1);
    const hpMp: (keyof Stats) = effect.targetStat === EffectTargetStat.hp ? 'hp' : 'mp';

    let effectiveHealing: number = 0;

    if(result.dmgRollResult) effectiveHealing = result.dmgRollResult.result;
    if(effect.flatAmount !== undefined) effectiveHealing = effect.flatAmount + healingBonus;
    if(!result.dmgRollResult && effect.flatAmount === undefined) console.log('omg I cant heal');

    if(targetChar.game.stats[hpMp] + effectiveHealing > targetChar.stats[hpMp]) {
        effectiveHealing = targetChar.stats[hpMp] - targetChar.game.stats[hpMp];
        targetChar.game.stats[hpMp] = targetChar.stats[hpMp];
    } else {
        targetChar.game.stats[hpMp] += (effectiveHealing + targetChar.game.stats.bonusHealingRcvd);
        if(targetChar.game.stats[hpMp] > targetChar.stats[hpMp]) targetChar.game.stats[hpMp] = targetChar.stats[hpMp];
    }

    newResult.totalHealingDone += effectiveHealing;
    newResult.effectResults.push({
        effect: effect,
        effectiveAmount: effectiveHealing, 
        castById: caster.game.gameId
    });

    return newResult;
}

function applyBuffOrDebuff(caster: GameChar, result: ActionResult, effect: Effect, isWeapon?: boolean): ActionResult {
    const newResult: ActionResult = result;

    if(!effectAlreadyApplied(
        result.newTargetChar.game.activeEffects, caster.game.gameId, result.action.name, effect.targetStat)
    ) {
        const directionMod: number = effect.type === EffectType.buff ? 1 : -1;
        const bonus: number = getBonus(caster.game.stats, effect, isWeapon ?? false, 1);
        let amount: number = 0;

        if(result.dmgRollResult) amount = result.dmgRollResult.result * directionMod;
        if(effect.flatAmount !== undefined) amount = (effect.flatAmount + bonus) * directionMod;

        if(!result.dmgRollResult && effect.flatAmount === undefined) console.log('omg i cant buff/debuff');
        
        const newActiveEffect: ActiveEffect = {
            ...effect,
            effectiveAmount: amount, 
            durationElapsed: 0,
            castById: caster.game.gameId,
            actionName: result.action.name
        }

        newResult.newTargetChar.game.activeEffects.push(newActiveEffect);
        newResult.newTargetChar = applyStatEffect(newResult.newTargetChar, effect.targetStat, amount);
        newResult.totalStatEffects += amount;
        newResult.effectResults.push({
            effectiveAmount: amount, 
            effect: effect,
            castById: caster.game.gameId
        });
    }

    return newResult;
}

function applyHotOrDot(caster: GameChar, result: ActionResult, effect: Effect): ActionResult {
    const newResult: ActionResult = result;
    
    if(!effectAlreadyApplied(
        result.newTargetChar.game.activeEffects, caster.game.gameId, result.action.name, effect.targetStat)
    ) {
            const newActiveEffect: ActiveEffect = {
            ...effect, 
            effectiveAmount: 0, 
            durationElapsed: 0,
            castById: caster.game.gameId,
            actionName: result.action.name
        }
        
        newResult.newTargetChar.game.activeEffects.push(newActiveEffect);
        newResult.effectResults.push({
            effectiveAmount: 0, 
            effect: effect,
            castById: caster.game.gameId
        });    
    }

    return newResult;
}

export function applyThreatEffect(caster: GameChar, result: ActionResult, effect: Effect): ActionResult {
    let amount: number = 0, effectiveAmount = 0;
    let bonus: number = getBonus(caster.stats, effect, result.action.isWeapon, result.action.hands ?? 1);
    let targetThreat: number = result.newTargetChar.game.meters.threat;

    if(effect.roll) amount = rollDie(effect.roll).result;
    if(effect.flatAmount) amount = effect.flatAmount;
    if(amount < 0) bonus = -bonus; //threat effects can be negative

    amount += bonus;
    effectiveAmount = (targetThreat + amount < 0) ? targetThreat : amount;
    targetThreat += effectiveAmount;

    result.newTargetChar.game.meters.threat = targetThreat;
    result.effectResults.push({
        effectiveAmount: effectiveAmount, 
        effect: effect,
        castById: caster.game.gameId
    });

    return result;
}

export function applyStatEffect(targetChar: GameChar, targetStat: EffectTargetStat, effectAmount: number): GameChar {
    const stats: Stats = targetChar.game.stats;

    //'threat' effects will never hit this! They are not a buff or debuff
    switch(targetStat) {
        case 'ac': stats.ac += effectAmount; break;
        case 'mac': stats.mac += effectAmount; break;
        case 'mvt': if(stats.mvt + effectAmount > 0) {stats.mvt += effectAmount} else {stats.mvt = 0}
            break;
        case 'allAtkRolls': 
            stats.dmgTypes.melee.atk += effectAmount;
            stats.dmgTypes.ranged.atk += effectAmount;
            stats.dmgTypes.magic.atk += effectAmount;
            break;
        case 'allDmgRolls': 
            stats.dmgTypes.melee.dmg += effectAmount;
            stats.dmgTypes.ranged.dmg += effectAmount;
            stats.dmgTypes.magic.dmg += effectAmount;
            break;
        case 'allDr':
            stats.dmgTypes.melee.dr += effectAmount;
            stats.dmgTypes.ranged.dr += effectAmount;
            stats.dmgTypes.magic.dr += effectAmount;
        break;
        case 'threatMultiplier': stats.threatMuliplier += effectAmount; break;
        case 'meleeAtk': stats.dmgTypes.melee.atk += effectAmount; break;
        case 'rangedAtk': stats.dmgTypes.ranged.atk += effectAmount; break;
        case 'magicAtk': stats.dmgTypes.magic.atk += effectAmount; break;
        case 'meleeDmg': stats.dmgTypes.melee.dmg += effectAmount; break;
        case 'rangedDmg': stats.dmgTypes.ranged.dmg += effectAmount; break;
        case 'magicDmg': stats.dmgTypes.magic.dmg += effectAmount; break;
        case 'meleeDr': stats.dmgTypes.melee.dr += effectAmount; break;
        case 'rangedDr': stats.dmgTypes.ranged.dr += effectAmount; break;
        case 'magicDr': stats.dmgTypes.magic.dr += effectAmount; break;
        case 'bonusHealingDone': stats.bonusHealingDone += effectAmount; break;
        case 'bonusHealingRcvd': stats.bonusHealingRcvd += effectAmount; break;
        case 'shadowDmg': stats.dmgTypes.shadow.dmg += effectAmount; break;
        default: console.log('no targetStat!');
    }

    targetChar.game.stats = stats;

    return targetChar;
}

export function hotTick(caster: GameChar, effect: Effect): {amount: number, rollResult?: RollResult} {
    if(effect.type === EffectType.hot) {
        const dmgMod: number = getBonus(caster.game.stats, effect, false, 1);

        if(effect.roll) {
            const totalMod: number = Math.floor((effect.roll.mod + dmgMod) / effect.duration);
            const healingRoll: RollResult = rollDie({...effect.roll, mod: totalMod});
            return {amount: healingRoll.result, rollResult: healingRoll}
        } else if(effect.flatAmount !== undefined) {
            const totalHealingAmount: number = effect.flatAmount + dmgMod;
            const tickAmount: number = Math.floor(totalHealingAmount / effect.duration)
            return {amount: tickAmount}
        } else {return {amount: 0}}

    } else {return {amount: 0}}
}

export function dotTick(caster: GameChar, target: GameChar, effect: Effect): number {
    if(effect.type === EffectType.dot) {
        const dmgMod: number = getBonus(caster.game.stats, effect, false, 1);
        const targetDr: number = target.game.stats.dmgTypes[effect.dmgType].dr;

        if(effect.roll) {
            const totalMod: number = effect.roll.mod + dmgMod;
            const damageRoll: RollResult = rollDie({...effect.roll, mod: totalMod});
            let result: number = damageRoll.result - targetDr;
            return result < 1 ? 1 : result;
        } else if(effect.flatAmount !== undefined) {
            const totalAmount: number = effect.flatAmount + dmgMod;
            let tickAmount: number = Math.floor(totalAmount / effect.duration);
            tickAmount -= targetDr;
            return tickAmount < 1 ? 1 : tickAmount;
        } else {return 0}
    } else {return 0}
}

export function isAoe(action: Action): boolean {
    return [TargetingType.burst, TargetingType.line].includes(action.target)
}

export function isBurst(action: Action): boolean {
    return action.target === TargetingType.burst && action.hasOwnProperty('burstRadius')
}

export function isBurstOnSelf(action: Action): boolean {
    return action.range === 0 && isBurst(action)
}

export function isLine(action: Action): boolean {return action.target === TargetingType.line}

export function getTargetTypes(actionIntent: Intent, actorType: CharType): CharType[] {
    if(actionIntent === 'offense') {
        return actorType === CharType.player ? [CharType.enemy, CharType.beast] : [CharType.player]
    } else {
        return actorType === CharType.player ? [CharType.player] : [CharType.enemy, CharType.beast]
    }
}

export function effectAlreadyApplied(
    targetActiveEffects: ActiveEffect[], castById: string, actionName: string, targetStat?: EffectTargetStat
): boolean {
    return targetActiveEffects.some(ae => ae.castById === castById && ae.actionName === actionName 
        && (targetStat ? ae.targetStat === targetStat : true))
}

export function blankAction(): Action {
    return {
        _id: '',
        name: 'click to name me',
        intent: Intent.offense,
        range: 1,
        isWeapon: true,
        mpCost: 0,
        effects: [blankEffect()],
        target: TargetingType.single,
        dmgType: DamageType.melee
    }
}

function blankActionResult(targetChar: GameChar, action: Action): ActionResult {
    return {
        newTargetChar: targetChar,
        action: action,
        effectResults: [],
        totalDmgDone: 0,
        totalHealingDone: 0,
        totalStatEffects: 0,
        success: false
    }
}

export function blankEffect(): Effect {
    return {
        type: EffectType.damage,
        dmgType: DamageType.melee,
        targetStat: EffectTargetStat.hp,
        duration: 0,
        targetsSelf: false,
        roll: {
            numDie: 1,
            dieSides: 4,
            mod: 0
        }
    }
}