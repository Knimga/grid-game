import {Action, Armor, Attributes, Stats, Effect, EffectType, EffectTargetStat} from '../types' ;

import { getBonus } from './charCalc';

import { InputOption } from '../uiTypes';

export function attributeDetailString(attribute: keyof Attributes) {
    switch(attribute) {
        case 'strength': return "Increases HP, melee prowess, movement speed, and affinity with fire and holy";
        case 'finesse': return "Increases AC, MAC, movement speed, initiative, ranged prowess, overall accuracy, and affinity to wind and poison";
        case 'toughness': return "Increases HP, physical damage resistance, and earth affinity";
        case 'mind': return "Increases MP, MAC, magical prowess, initiative, and shadow affinity";
        case 'spirit': return "Increases MAC, magic damage resistance, HP/MP regen, healing done/received, and affinity with water and holy";
        default: return 'oops';
    }
}

export function armorDetailString(armor: Armor): string {
    return `AC ${armor.ac}, MAC ${armor.mac}`
}

export function effectDamageString(effect: Effect, stats: Stats | null, isWeapon: boolean, hands: number): string {
    if(effect.roll) return rollString(effect, stats, hands, isWeapon);
    return flatAmountString(effect, stats, hands, isWeapon);
}

export function effectDmgDesc(effect: Effect): string {
    return effectTypeString(effect.type) + ` (${effectTargetStatString(effect.targetStat)})`
}

export function effectDurationString(effect: Effect): string {
    if(effect.duration === 0) return 'Instant';
    let qualifier: string = 'For';
    if(['hot','dot'].includes(effect.type) && effect.flatAmount) qualifier = 'Over';
    return `${qualifier} ${effect.duration} rounds`;
}

export function actionDetailString(action: Action, stats: Stats | null): string {
    const strings: string[] = [];
    const effects: Effect[] = action.effects;

    for (let e = 0; e < effects.length; e++) {
        switch(effects[e].type) {
            case EffectType.damage: strings.push(dmgString(effects[e], stats, action.hands ?? 1)); break;
            case EffectType.healing: strings.push(healString(effects[e], stats)); break;
            case EffectType.buff: strings.push(buffOrDebuffString(effects[e], stats)); break;
            case EffectType.debuff: strings.push(buffOrDebuffString(effects[e], stats)); break;
            case EffectType.hot: strings.push(hotString(effects[e], stats)); break;
            case EffectType.dot: strings.push(dotString(effects[e], stats)); break;
            default: break;
        }
    }

    strings[strings.length - 1] += aoeStringEnding(action);
    strings[0] = strings[0][0].toUpperCase() + strings[0].substring(1);
    if(strings.length > 1) strings[strings.length - 1] = 'and ' + strings[strings.length - 1];
    
    return strings.join(', ');
}

function aoeStringEnding(action: Action): string {
    if(action.burstRadius) {
        if(action.range === 0) {
            return ' to adjacent targets'
        } else {
            const burstAreaSize: number = (action.burstRadius * 2) + 1;
            return ` to targets in a ${burstAreaSize}x${burstAreaSize} area`
        }
    } else if(action.target === 'line') {
        return ' to targets on a line'
    } else {return ''}
}

function dmgString(effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean): string {
    if(effect.type === 'damage') {
        const amount: string = effect.roll ? 
            rollString(effect, stats, hands, isWeapon ?? false) : flatAmountString(effect, stats, hands);
        return `deals ${amount} ${effect.dmgType} damage`;
    } else {return ''}
}

function healString(effect: Effect, stats: Stats | null): string {
    if(effect.type === 'healing') {
        const targetStat: string = effectTargetStatString(effect.targetStat);
        const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
        return `restores ${amount} ${targetStat}`;
    } else {return ''}
}

function buffOrDebuffString(effect: Effect, stats: Stats | null): string {
    const qualifierWord: string = effect.type === 'buff' ? 'Increases' : 'decreases';
    const targetStat: string = effectTargetStatString(effect.targetStat);
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
    return `${qualifierWord} ${targetStat} by ${amount} for ${effect.duration} rounds`;
}

function hotString(effect: Effect, stats: Stats | null): string {
    if(effect.type === 'hot') {
        const targetStat: string = effectTargetStatString(effect.targetStat);
        const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
        return `restores ${amount} ${targetStat} over ${effect.duration} rounds`
    } else {return ''}
}

function dotString(effect: Effect, stats: Stats | null): string {
    if(effect.type === 'dot') {
        const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
        return `deals ${amount} ${effect.dmgType} damage over ${effect.duration} rounds`;
    } else {return ''}
}

function rollString(effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean): string {
    if(effect.roll) {
        const bonus: number = (stats) ? getBonus(stats, effect, isWeapon ?? false, hands ?? 1) : 0;
        const baseRollString: string = `${effect.roll.numDie}d${effect.roll.dieSides}`;
        const totalBonus: number = bonus + effect.roll.mod;
        return `${baseRollString}${totalBonus ? `+${totalBonus}` : ''}`
    } else {return ''}
}

function flatAmountString(effect: Effect, stats: Stats | null,hands: number, isWeapon?: boolean): string {
    if(effect.flatAmount !== undefined) {
        const bonus: number = stats ? getBonus(stats, effect, isWeapon ?? false, hands ?? 1) : 0;
        return `${effect.flatAmount + bonus}`
    } else {return ''}
}

export function effectTargetStatString(targetStat: EffectTargetStat | string): string {
    switch(targetStat) {
        case 'hp': return 'HP';
        case 'hpRegen': return 'HP Regen';
        case 'mp': return 'MP';
        case 'mpRegen': return 'MP Regen';
        case 'ac': return 'AC';
        case 'mac': return 'MAC';
        case 'mvt': return 'Mvt';
        case 'bonusHealingDone': return 'Heals Done';
        case 'bonusHealingRcvd': return 'Heals Rcvd';
        case 'allAtkRolls': return 'Atk Rolls';
        case 'allDmgRolls': return 'Dmg Rolls';
        case 'allDr': return 'DR';
        case 'meleeAtk': return 'Melee Atk';
        case 'meleeDmg': return 'Melee Dmg';
        case 'meleeDr': return 'Melee DR';
        case 'rangedAtk': return 'Ranged Atk';
        case 'rangedDmg': return 'Ranged Dmg';
        case 'rangedDr': return 'Ranged DR';
        case 'magicAtk': return 'Magic Atk';
        case 'magicDmg': return 'Magic Dmg'
        case 'magicDr': return 'Magic DR';
        case 'shadowDmg': return 'Shadow Dmg';
        default: return '[no targetStat]';
    }
}

function effectTypeString(effectType: EffectType): string {
    switch(effectType) {
        case EffectType.damage: return 'Damage';
        case EffectType.healing: return 'Healing';
        case EffectType.buff: return 'Buff';
        case EffectType.debuff: return 'Debuff';
        case EffectType.hot: return 'Healing';
        case EffectType.dot: return 'Damage';
    }
}

export function makeInputOptions(strings: string[]): InputOption[] {
    return strings.map(str => {return {enumValue: str, displayValue: cap(str)}})
}

export function makeInputOptionsWithIds(items: any[]): InputOption[] {
    return items.map(item => {return {enumValue: item._id, displayValue: item.name}})
}

export function cap(str: string): string {return str[0].toUpperCase() + str.substring(1)}
