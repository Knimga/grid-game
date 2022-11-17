import { rollDie, rollD20 } from './roller';

import { dmgDoneAndTaken, healingDone } from './meters';
import { getAtkBonus, isElemental, getBonus } from './charCalc';

import { 
    Roll, RollResult, GameChar, Action, ActionResult, Effect, EffectTargetStat, 
    ActiveEffect, EffectType, CharType, Intent, DamageType, TargetingType, Stats 
} from '../types';

import { MetersEntry } from '../uiTypes';

export function resolveAction(actor: GameChar, targets: GameChar[], action: Action): ActionResult[] {
    const effects: Effect[] = [...action.effects];
    const autoSuccess: boolean = getTargetTypes(action.intent, actor.type).includes(actor.type);

    let results: ActionResult[] = targets.map(char => {
        return {
            newChar: char,
            action: action,
            effectResults: [],
            totalDmgDone: 0,
            totalHealingDone: 0,
            totalStatEffects: 0,
            success: false
        }
    });

    if(autoSuccess) {
        results.forEach(result => result.success = true)
    } else {
        const atkRoll: RollResult = rollD20(getAtkBonus(actor.game.stats, action.dmgType));

        for (let r = 0; r < results.length; r++) {
            const targetAC: number = isElemental(action.dmgType) || action.dmgType === DamageType.magic ? 
                results[r].newChar.game.stats.mac : results[r].newChar.game.stats.ac;
            results[r].atkRollResult = atkRoll;
            if(atkRoll.result > targetAC) results[r].success = true;
        }
    }

    for (let r = 0; r < results.length; r++) {
        if(results[r].success) {
            for (let e = 0; e < effects.length; e++) {
                const roll: Roll | undefined = effects[e].roll;
                const bonus: number = getBonus(actor.game.stats, effects[e], action.isWeapon, action.hands ?? 1);
                let effectRollResult: RollResult | null = null;
    
                if(roll) effectRollResult = rollDie({...roll, mod: roll.mod + bonus});
    
                if(effectRollResult) results[r].dmgRollResult = effectRollResult;
                
                switch(effects[e].type) {
                    case EffectType.healing: results[r] = applyHeal(actor, results[r], effects[e]); break;
                    case EffectType.damage: results[r] = applyDamage(actor, results[r], effects[e], action.isWeapon, action.hands ?? 1); break;
                    case EffectType.buff: results[r] = applyBuffOrDebuff(actor, results[r], effects[e]); break;
                    case EffectType.debuff: results[r] = applyBuffOrDebuff(actor, results[r], effects[e]); break;
                    case EffectType.hot: results[r] = applyHotOrDot(actor, results[r], effects[e]); break;
                    case EffectType.dot: results[r] = applyHotOrDot(actor, results[r], effects[e]); break;
                    default: console.log('no effect valid type!'); break;
                }
            }
        }
    }

    return results;
}

function applyHeal(caster: GameChar, result: ActionResult, effect: Effect): ActionResult {
    const newResult: ActionResult = result;
    const targetChar: GameChar = newResult.newChar;
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

function applyDamage(attacker: GameChar, result: ActionResult, effect: Effect, isWeapon: boolean, hands: number): ActionResult {
    const newResult: ActionResult = result;
    const getsMagicDr: boolean = !isWeapon && (isElemental(effect.dmgType) || effect.dmgType === DamageType.magic);
    const dmgBonus: number = getBonus(attacker.game.stats, effect, isWeapon ?? false, hands ?? 1);
    const hpMp: (keyof Stats) = effect.targetStat === EffectTargetStat.hp ? 'hp' : 'mp';

    let targetDr: number = result.newChar.game.stats.dmgTypes[effect.dmgType].dr;
    if(getsMagicDr) targetDr += attacker.game.stats.dmgTypes.magic.dr;

    let effectiveDamage: number = 0;

    if(result.dmgRollResult) effectiveDamage = result.dmgRollResult.result - targetDr;
    if(effect.flatAmount !== undefined) effectiveDamage = effect.flatAmount + dmgBonus - targetDr;
    
    if(effectiveDamage < 1) effectiveDamage = 1;

    if(!result.dmgRollResult && effect.flatAmount === undefined) console.log('omg i cant do damage');

    if(newResult.newChar.game.stats[hpMp] - effectiveDamage < 0) {
        effectiveDamage = newResult.newChar.game.stats[hpMp];
        newResult.newChar.game.stats[hpMp] = 0;
    } else {
        newResult.newChar.game.stats[hpMp] -= effectiveDamage;
    }

    if(newResult.newChar.game.stats.hp <= 0) newResult.charDiedThisTurn = true;

    newResult.totalDmgDone += effectiveDamage;
    newResult.effectResults.push({
        effectiveAmount: effectiveDamage, 
        effect: effect,
        castById: attacker.game.gameId
    });

    return newResult;
}

function applyBuffOrDebuff(caster: GameChar, result: ActionResult, effect: Effect, isWeapon?: boolean): ActionResult {
    const newResult: ActionResult = result;

    if(!effectAlreadyApplied(result.newChar.game.activeEffects, caster.game.gameId, result.action.name)) {
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

        newResult.newChar.game.activeEffects.push(newActiveEffect);
        newResult.newChar = applyStatEffect(newResult.newChar, effect.targetStat, amount);
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
    
    if(!effectAlreadyApplied(result.newChar.game.activeEffects, caster.game.gameId, result.action.name)) {
            const newActiveEffect: ActiveEffect = {
            ...effect, 
            effectiveAmount: 0, 
            durationElapsed: 0,
            castById: caster.game.gameId,
            actionName: result.action.name
        }
        
        newResult.newChar.game.activeEffects.push(newActiveEffect);
        newResult.effectResults.push({
            effectiveAmount: 0, 
            effect: effect,
            castById: caster.game.gameId
        });    
    }

    return newResult;
}

function hotTick(caster: GameChar, effect: Effect): {amount: number, rollResult?: RollResult} {
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

function dotTick(caster: GameChar, target: GameChar, effect: Effect): number {
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

function applyStatEffect(targetChar: GameChar, targetStat: EffectTargetStat, effectAmount: number): GameChar {
    const newChar: GameChar = {...targetChar}

    switch(targetStat) {
        case 'ac': newChar.game.stats.ac += effectAmount; break;
        case 'mvt': if(newChar.game.stats.mvt + effectAmount > 0) {
                newChar.game.stats.mvt += effectAmount
            } else {newChar.game.stats.mvt = 0}
            break;
        case 'allAtkRolls': 
            newChar.game.stats.dmgTypes.melee.atk += effectAmount;
            newChar.game.stats.dmgTypes.ranged.atk += effectAmount;
            newChar.game.stats.dmgTypes.magic.atk += effectAmount;
        break;
        case 'allDmgRolls': 
            newChar.game.stats.dmgTypes.melee.dmg += effectAmount;
            newChar.game.stats.dmgTypes.ranged.dmg += effectAmount;
            newChar.game.stats.dmgTypes.magic.dmg += effectAmount;
        break;
        case 'allDr':
            newChar.game.stats.dmgTypes.melee.dr += effectAmount;
            newChar.game.stats.dmgTypes.ranged.dr += effectAmount;
            newChar.game.stats.dmgTypes.magic.dr += effectAmount;
        break;
        case 'meleeAtk': newChar.game.stats.dmgTypes.melee.atk += effectAmount; break;
        case 'rangedAtk': newChar.game.stats.dmgTypes.ranged.atk += effectAmount; break;
        case 'magicAtk': newChar.game.stats.dmgTypes.magic.atk += effectAmount; break;
        case 'meleeDmg': newChar.game.stats.dmgTypes.melee.dmg += effectAmount; break;
        case 'rangedDmg': newChar.game.stats.dmgTypes.ranged.dmg += effectAmount; break;
        case 'magicDmg': newChar.game.stats.dmgTypes.magic.dmg += effectAmount; break;
        case 'meleeDr': newChar.game.stats.dmgTypes.melee.dr += effectAmount; break;
        case 'rangedDr': newChar.game.stats.dmgTypes.ranged.dr += effectAmount; break;
        case 'magicDr': newChar.game.stats.dmgTypes.magic.dr += effectAmount; break;
        case 'bonusHealingDone': newChar.game.stats.bonusHealingDone += effectAmount; break;
        case 'bonusHealingRcvd': newChar.game.stats.bonusHealingRcvd += effectAmount; break;
        case 'shadowDmg': newChar.game.stats.dmgTypes.shadow.dmg += effectAmount; break;
        default: console.log('no targetStat!');
    }

    return newChar;
}

export function getTargetTypes(actionIntent: Intent, actorType: CharType): CharType[] {
    if(actionIntent === 'offense') {
        return actorType === CharType.player ? [CharType.enemy, CharType.beast] : [CharType.player]
    } else {
        return actorType === CharType.player ? [CharType.player] : [CharType.enemy, CharType.beast]
    }
}

export function setNewRound(oldChars: GameChar[], oldMeters: MetersEntry[]): {
    newChars: GameChar[], newMeters: MetersEntry[], whoDied: string[]
} {
    const newChars: GameChar[] = [...oldChars];
    const whoDied: string[] = [];
    let newMeters: MetersEntry[] = [...oldMeters];

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
                        newMeters = healingDone(
                            newMeters, activeEffects[e].castById, effectiveHealingTick, activeEffects[e].targetStat
                        );
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
                        newMeters = dmgDoneAndTaken(
                            newMeters, activeEffects[e].castById, newChars[c].game.gameId, 
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

    return {newChars: newChars, newMeters: newMeters, whoDied: whoDied};
}

export function effectAlreadyApplied(
    targetActiveEffects: ActiveEffect[], castById: string, actionName: string
): boolean {
    return targetActiveEffects.some(ae => ae.castById === castById && ae.actionName === actionName)
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

export function blankEffect(): Effect {
    return {
        type: EffectType.damage,
        dmgType: DamageType.melee,
        targetStat: EffectTargetStat.hp,
        duration: 0,
        roll: {
            numDie: 1,
            dieSides: 4,
            mod: 0
        }
    }
}