import { getBonus } from './charCalc';

import {Action, Armor, Attributes, Stats, Effect, Dungeon, Door} from '../types/types';
import { InputOption } from '../types/uiTypes';
import { EffectType, EffectTargetStat } from '../types/enums';



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

export function armorDetailString(armor: Armor): string {return `AC ${armor.ac}, MAC ${armor.mac}`}

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
    const effects: Effect[] = action.effects.filter(e => !e.targetsSelf);
    const selfEffects: Effect[] = action.effects.filter(e => e.targetsSelf);

    for (let e = 0; e < effects.length; e++) strings.push(effectDetailString(effects[e], stats));

    strings[strings.length - 1] += aoeStringEnding(action);

    for (let s = 0; s < selfEffects.length; s++) strings.push(effectDetailString(selfEffects[s], stats));

    strings[0] = cap(strings[0]);
    if(strings.length > 1) strings[strings.length - 1] = 'and ' + strings[strings.length - 1];
    
    return strings.join(', ');
}

function effectDetailString(effect: Effect, stats: Stats | null, actionHands?: number): string {
    switch(effect.type) {
        case EffectType.damage: return dmgString(effect, stats, actionHands ?? 1);
        case EffectType.healing: return healString(effect, stats);
        case EffectType.buff: return buffOrDebuffString(effect, stats);
        case EffectType.debuff: return buffOrDebuffString(effect, stats);
        case EffectType.hot: return hotString(effect, stats);
        case EffectType.dot: return dotString(effect, stats);
        case EffectType.threat: return threatString(effect, stats);
        default: console.log('omg'); return '';
    }
}

function aoeStringEnding(action: Action): string {
    if(action.burstRadius) {
        if(action.range === 0) {
            return ' to adjacent targets'
        } else {
            const burstAreaSize: number = (action.burstRadius * 2) + 1;
            return ` to targets in a ${burstAreaSize}x${burstAreaSize} area`
        }
    }
    if(action.target === 'line') return ' to targets on a line';
    return '';
}

function dmgString(effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean): string {
    if(effect.type === 'damage') {
        const amount: string = effect.roll ? 
            rollString(effect, stats, hands, isWeapon ?? false) : flatAmountString(effect, stats, hands);
        const mpDmg: string = effect.targetStat === 'mp' ? ' to MP' : '';
        const pronoun: string = effect.targetsSelf ? 'to yourself' : '';
        return `deals ${amount} ${effect.dmgType} ${mpDmg} damage ${pronoun}`;
    } else {return ''}
}

function healString(effect: Effect, stats: Stats | null): string {
    if(effect.type === 'healing') {
        const targetStat: string = effectTargetStatString(effect.targetStat);
        const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
        const pronoun: string = effect.targetsSelf ? 'to you' : '';
        return `restores ${amount} ${targetStat} ${pronoun}`;
    } else {return ''}
}

function buffOrDebuffString(effect: Effect, stats: Stats | null): string {
    const qualifier: string = effect.type === 'buff' ? 'increases' : 'decreases';
    const pronoun: string = effect.targetsSelf ? 'your' : '';
    const targetStat: string = effectTargetStatString(effect.targetStat);
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
    return `${qualifier} ${pronoun} ${targetStat} by ${amount} for ${effect.duration} rounds`;
}

function hotString(effect: Effect, stats: Stats | null): string {
    if(effect.type === 'hot') {
        const targetStat: string = effectTargetStatString(effect.targetStat);
        const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
        const pronoun: string = effect.targetsSelf ? 'to you' : '';
        return `restores ${amount} ${targetStat} ${pronoun} over ${effect.duration} rounds`
    } else {return ''}
}

function dotString(effect: Effect, stats: Stats | null): string {
    if(effect.type === 'dot') {
        const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
        const pronoun: string = effect.targetsSelf ? 'to you' : '';
        return `deals ${amount} ${effect.dmgType} damage ${pronoun} over ${effect.duration} rounds`;
    } else {return ''}
}

function threatString(effect: Effect, stats: Stats | null): string {
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1, false, true);
    const amountIsPositive: boolean = effect.flatAmount !== undefined && effect.flatAmount >= 0;
    const qualifier: string = amountIsPositive ? 'increases' : 'decreases';
    const pronoun: string = effect.targetsSelf ? 'your' : '';
    const duration: string = effect.duration ? `for ${effect.duration} rounds` : '';
    return `${qualifier} ${pronoun} threat by ${amount} ${duration}`;
}

function rollString(effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean): string {
    if(effect.roll) {
        const bonus: number = (stats) ? getBonus(stats, effect, isWeapon ?? false, hands ?? 1) : 0;
        const baseRollString: string = `${effect.roll.numDie}d${effect.roll.dieSides}`;
        const totalBonus: number = bonus + effect.roll.mod;
        return `${baseRollString}${totalBonus ? `+${totalBonus}` : ''}`
    } else {return ''}
}

function flatAmountString(
    effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean, returnAbs?: boolean
): string {
    if(effect.flatAmount !== undefined) {
        let bonus: number = stats ? getBonus(stats, effect, isWeapon ?? false, hands ?? 1) : 0;
        if(effect.flatAmount < 0) bonus = -bonus;
        let amount: number = effect.flatAmount + bonus;
        if(returnAbs) amount = Math.abs(amount);
        return amount.toString();
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
        case 'strength': return 'Strength';
        case 'finesse': return 'Finesse';
        case 'toughness': return 'Toughness';
        case 'mind': return 'Mind';
        case 'spirit': return 'Spirit';
        case 'threat': return 'Threat';
        case 'bonusHealingDone': return 'Healing Done';
        case 'bonusHealingRcvd': return 'Healing Rcvd';
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
        case 'fireAtk': return 'Fire Atk';
        case 'fireDmg': return 'Fire Dmg'
        case 'fireDr': return 'Fire DR';
        case 'windAtk': return 'Wind Atk';
        case 'windDmg': return 'Wind Dmg'
        case 'windDr': return 'Wind DR';
        case 'earthAtk': return 'Earth Atk';
        case 'earthDmg': return 'Earth Dmg'
        case 'earthDr': return 'Earth DR';
        case 'shadowAtk': return 'Shadow Atk';
        case 'shadowDmg': return 'Shadow Dmg'
        case 'shadowDr': return 'Shadow DR';
        case 'waterAtk': return 'Water Atk';
        case 'waterDmg': return 'Water Dmg'
        case 'waterDr': return 'Water DR';
        case 'holyAtk': return 'Holy Atk';
        case 'holyDmg': return 'Holy Dmg'
        case 'holyDr': return 'Holy DR';
        case 'poisonAtk': return 'Poison Atk';
        case 'poisonDmg': return 'Poison Dmg'
        case 'poisonDr': return 'Poison DR';
        case 'lightningAtk': return 'Lightning Atk';
        case 'lightningDmg': return 'Lightning Dmg'
        case 'lightningDr': return 'Lightning DR';
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
        case EffectType.threat: return 'Threat';
    }
}

export function passiveEffectString(effect: {targetStat: EffectTargetStat, amount: number}): string {
    const operator: string = effect.amount >= 0 ? '+' : '';
    if(effect.targetStat === EffectTargetStat.threatMuliplier) {
        return `${passiveEffectThreatString(effect.amount)} Threat`
    }
    return `${operator}${effect.amount} ${effectTargetStatString(effect.targetStat)}`;
}

function passiveEffectThreatString(threatModifer: number): string {//for threat mods from effects
    const value: number = threatModifer * 100;
    const operator: string = threatModifer >= 0 ? '+' : '-';
    return `${operator}${value}%`;
}

export function charThreatString(threatMuliplier: number): string {//for threatMult value on a char
    const diffValue: number = (threatMuliplier - 1) * 100;
    const operator: string = diffValue >= 0 ? '+' : '-';
    return `${operator}${diffValue.toFixed(0)}%`
}

export function makeInputOptions(strings: string[]): InputOption[] {
    return strings.map(str => {return {enumValue: str, displayValue: cap(str)}})
}

export function makeInputOptionsWithIds(items: any[]): InputOption[] {
    return items.map(item => {return {enumValue: item._id, displayValue: item.name}})
}

export function doorInputOptions(dungeon: Dungeon): InputOption[] {
    const doors: Door[] = dungeon.boards.map(board => board.doors).flat(1);
    const blankOption: InputOption = {enumValue: '', displayValue: ''};
    const options: InputOption[] = doors.map(door => {
        return {enumValue: door.id, displayValue: `${door.name[1]}-${door.name[2]}`}}
    );
    return [blankOption, ...options];
}

export function cap(str: string): string {return str[0].toUpperCase() + str.substring(1)}

export function allCaps(str: string): string {
    return str.split('').map(letter => letter.toUpperCase()).join('')
}

export function randId(): string {return Math.random().toString().substring(2)}