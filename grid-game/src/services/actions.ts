import { rollDie, rollD20 } from './roller';

import { 
    getAtkBonus, isElemental, getBonus, applyStatEffect, applyAttrEffect, applyAffinityEffect,
    never0
} from './charCalc';

import { updateMeters } from './meters';

import { 
    RollResult, GameChar, Action, ActionResult, Effect, ActiveEffect, Stats 
} from '../types/types';
import { 
    EffectTargetStat, EffectType, CharType, Intent, DamageType, TargetingType, TargetStatType 
} from '../types/enums';

export function applyActionResults(
    actor: GameChar, results: ActionResult[], oldChars: GameChar[]
): GameChar[] {
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
        blankResults.forEach(result => result.success = true);
        return applyEffects(actor, blankResults, action);
    } 

    const atkRoll: RollResult = rollD20(getAtkBonus(actor.game.stats, action.dmgType));

    for (let r = 0; r < blankResults.length; r++) {
        const isMagic: boolean = isElemental(action.dmgType) || action.dmgType === DamageType.magic;
        const targetAC: number = blankResults[r].newTargetChar.game.stats[(isMagic ? 'mac' : 'ac')];
        blankResults[r].atkRollResult = atkRoll;
        if(atkRoll.result > targetAC) blankResults[r].success = true;
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

    if(targetSelfEffects.length && results.some(r => r.success)) {
        const originalSelfResult: ActionResult | undefined = results.find(
            r => r.newTargetChar.game.gameId === actor.game.gameId);
        let newSelfResult: ActionResult = blankActionResult(actor, action);

        if(originalSelfResult) newSelfResult = {...originalSelfResult};
        
        newSelfResult.success = true;
        
        for (let e = 0; e < targetSelfEffects.length; e++) {
            newSelfResult.dmgRollResult = rollDmgOrHealing(actor, action, targetSelfEffects[e]);
            newSelfResult = applyEffect(actor, newSelfResult, action, targetSelfEffects[e]);
        }

        if(!originalSelfResult) {
            results.push(newSelfResult)
        } else {
            const selfIndex: number = results.indexOf(originalSelfResult);
            results[selfIndex] = newSelfResult;
        }
    }

    return results;
}

function rollDmgOrHealing(actor: GameChar, action: Action, effect: Effect): RollResult | undefined {
    if(!effect.roll) return undefined;
    const bonus: number = getBonus(actor.game.stats, effect, action.isWeapon, action.hands ?? 1);
    return rollDie({...effect.roll, mod: effect.roll.mod + bonus});
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
        default: console.log('no valid effect type!'); return result;
    }
}

function applyDamage(
    attacker: GameChar, result: ActionResult, effect: Effect, isWeapon: boolean, hands: number
): ActionResult {
    const getsMagicDr: boolean = !isWeapon && (isElemental(effect.dmgType) || effect.dmgType === DamageType.magic);
    const dmgBonus: number = getBonus(attacker.game.stats, effect, isWeapon ?? false, hands ?? 1);
    const hpMp: (keyof Stats) = effect.targetStat === EffectTargetStat.hp ? 'hp' : 'mp';

    let targetDr: number = result.newTargetChar.game.stats.dmgTypes[effect.dmgType].dr;
    let effectiveDamage: number = 0;

    if(getsMagicDr) targetDr += attacker.game.stats.dmgTypes.magic.dr;

    if(result.dmgRollResult) effectiveDamage = never0(result.dmgRollResult.result - targetDr);
    if(effect.flatAmount !== undefined) {
        effectiveDamage = never0(effect.flatAmount + dmgBonus - targetDr)
    }

    if(!result.dmgRollResult && effect.flatAmount === undefined) console.log('omg i cant do damage');

    if(result.newTargetChar.game.stats[hpMp] - effectiveDamage < 0) {
        effectiveDamage = result.newTargetChar.game.stats[hpMp];
        result.newTargetChar.game.stats[hpMp] = 0;
    } else {
        result.newTargetChar.game.stats[hpMp] -= effectiveDamage
    }

    if(result.newTargetChar.game.stats.hp <= 0) result.charDiedThisTurn = true;

    result.totalDmgDone += effectiveDamage;
    result.effectResults.push({
        effectiveAmount: effectiveDamage, 
        effect: effect,
        castById: attacker.game.gameId
    });

    return result;
}

function applyHeal(caster: GameChar, result: ActionResult, effect: Effect): ActionResult {
    const targetChar: GameChar = result.newTargetChar;
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

    result.totalHealingDone += effectiveHealing;
    result.effectResults.push({
        effect: effect,
        effectiveAmount: effectiveHealing, 
        castById: caster.game.gameId
    });

    return result;
}

function applyBuffOrDebuff(caster: GameChar, result: ActionResult, effect: Effect, isWeapon?: boolean): ActionResult {
    if(effectAlreadyApplied(
        result.newTargetChar.game.activeEffects, caster.game.gameId, result.action.name, effect.targetStat)
    ) return result;
    
    let char: GameChar = result.newTargetChar;
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

    switch(effect.targetStat) {
        case 'strength': char = applyAttrEffect(char, 'strength', amount); break;
        case 'finesse': char = applyAttrEffect(char, 'finesse', amount); break;
        case 'toughness': char = applyAttrEffect(char, 'toughness', amount); break;
        case 'mind': char = applyAttrEffect(char, 'mind', amount); break;
        case 'spirit': char = applyAttrEffect(char, 'spirit', amount); break;
        case 'fireAff': char = applyAffinityEffect(char, 'fire', amount); break;
        case 'windAff': char = applyAffinityEffect(char, 'wind', amount); break;
        case 'earthAff': char = applyAffinityEffect(char, 'earth', amount); break;
        case 'shadowAff': char = applyAffinityEffect(char, 'shadow', amount); break;
        case 'waterAff': char = applyAffinityEffect(char, 'water', amount); break;
        case 'holyAff': char = applyAffinityEffect(char, 'holy', amount); break;
        case 'poisonAff': char = applyAffinityEffect(char, 'poison', amount); break;
        case 'lightningAff': char = applyAffinityEffect(char, 'lightning', amount); break;
        default: char.game.stats = applyStatEffect(char.game.stats, effect.targetStat, amount); break;
    }

    result.newTargetChar = char;
    result.newTargetChar.game.activeEffects.push(newActiveEffect);
    result.totalStatEffects += amount;
    result.effectResults.push({
        effectiveAmount: amount, 
        effect: effect,
        castById: caster.game.gameId
    });
    

    return result;
}

function applyHotOrDot(caster: GameChar, result: ActionResult, effect: Effect): ActionResult {
    if(effectAlreadyApplied(
        result.newTargetChar.game.activeEffects, caster.game.gameId, result.action.name, effect.targetStat)
    ) return result;

    const newActiveEffect: ActiveEffect = {
        ...effect, 
        effectiveAmount: 0, 
        durationElapsed: 0,
        castById: caster.game.gameId,
        actionName: result.action.name
    }
        
    result.newTargetChar.game.activeEffects.push(newActiveEffect);
    result.effectResults.push({
        effectiveAmount: 0, 
        effect: effect,
        castById: caster.game.gameId
    });    

    return result;
}

export function applyThreatEffect(caster: GameChar, result: ActionResult, effect: Effect): ActionResult {
    const targetThreat: number = result.newTargetChar.game.meters.threat;
    let amount: number = 0, effectiveAmount = 0;
    let bonus: number = getBonus(caster.stats, effect, result.action.isWeapon, result.action.hands ?? 1);

    if(result.dmgRollResult) amount = result.dmgRollResult.result;
    if(effect.flatAmount) amount = effect.flatAmount;

    amount += (amount < 0) ? -bonus : bonus; //threat effects can be negative
    effectiveAmount = (targetThreat + amount < 0) ? -targetThreat : amount;

    result.newTargetChar.game.meters.threat += effectiveAmount;

    result.effectResults.push({
        effectiveAmount: effectiveAmount, 
        effect: effect,
        castById: caster.game.gameId
    });

    return result;
}

export function hotTick(
    caster: GameChar, effect: Effect, targetBonusHealing: number, durationElapsed: number
): {amount: number, rollResult?: RollResult} {
    if(effect.type !== EffectType.hot) return {amount: 0}

    const dmgMod: number = getBonus(caster.game.stats, effect, false, 1);

    if(effect.roll) {
        const totalMod: number = Math.floor((effect.roll.mod + dmgMod) / effect.duration);
        const healingRoll: RollResult = rollDie({...effect.roll, mod: totalMod});
        return {amount: healingRoll.result, rollResult: healingRoll}
    } else if(effect.flatAmount !== undefined) {
        const totalHealingAmount: number = effect.flatAmount + dmgMod + targetBonusHealing;
        const tickAmount: number = overTimeTick(totalHealingAmount, effect.duration, durationElapsed);
        return {amount: tickAmount}
    } else {return {amount: 0}}
}

export function dotTick(caster: GameChar, target: GameChar, effect: Effect, durationElapsed: number): number {
    if(effect.type !== EffectType.dot) return 0;

    const dmgMod: number = getBonus(caster.game.stats, effect, false, 1);
    const targetDr: number = target.game.stats.dmgTypes[effect.dmgType].dr;

    if(effect.roll) {
        const totalMod: number = effect.roll.mod + dmgMod;
        const damageRoll: RollResult = rollDie({...effect.roll, mod: totalMod});
        const result: number = never0(damageRoll.result - targetDr);
        return result;
    } 
    if(effect.flatAmount !== undefined) {
        const totalAmount: number = effect.flatAmount + dmgMod;
        let tickAmount: number = overTimeTick(totalAmount, effect.duration, durationElapsed);
        tickAmount = never0(tickAmount - targetDr);
        return tickAmount;
    }
    console.log('no dmg info on effect!');
    return 0;
}

//only for use for flatAmount dots/hots - rolled dots/hots will have a roll performed for each tick
function overTimeTick(totalAmount: number, duration: number, durationElapsed: number): number {
    const quotient = Math.floor(totalAmount / duration);
	let remainder = totalAmount % duration;

    const ticks: number[] = Array(duration).fill(quotient);

	while(remainder > 0) {
		for (let i = 0; i < ticks.length; i++) {
			if(!remainder) break;
			ticks[i]++;
			remainder--;
		}
	}
	
	return ticks[durationElapsed - 1];
}

export function isPositiveEffect(effectType: EffectType): boolean {
    return ['healing', 'buff', 'hot', 'threat'].includes(effectType)
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

export function blankAction(name?: string): Action {
    return {
        _id: '',
        name: name || 'new action',
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
        targetStatType: TargetStatType.stat,
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