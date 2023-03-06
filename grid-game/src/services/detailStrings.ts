import { getBonus } from './charCalc';

import {Action, Armor, Attributes, Stats, Effect, Dungeon, Door, PassiveEffect, AttributeReq} from '../types/types';
import { InputOption } from '../types/uiTypes';
import { EffectType, EffectTargetStat, WeaponType, Intent } from '../types/enums';

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

export function actionDetailString(action: Action, stats: Stats | null, hands?: number): string {
    let strings: string[] = [];
    const effects: Effect[] = action.effects.filter(e => !e.targetsSelf);
    const selfEffects: Effect[] = action.effects.filter(e => e.targetsSelf);

    for (let e = 0; e < effects.length; e++) {
        strings.push(effectDetailString(effects[e], stats, hands))
    }

    

    //effectDetailString should no longer include duration
    //
    if(allDurationsEqual(action)) {
        strings[strings.length - 1] += effectDurationString(effects[0])
    } else {
        strings = strings.map((str, index) => str+effectDurationString(effects[index]))
    }

    strings[strings.length - 1] += aoeStringEnding(action);

    for (let s = 0; s < selfEffects.length; s++) strings.push(effectDetailString(selfEffects[s], stats, hands));

    strings[0] = cap(strings[0]);
    if(strings.length > 1) strings[strings.length - 1] = 'and ' + strings[strings.length - 1];
    
    return strings.join(' ');
}

function effectDetailString(effect: Effect, stats: Stats | null, actionHands?: number): string {
    switch(effect.type) {
        case EffectType.damage: return dmgDescString(effect, stats, actionHands ?? 1);
        case EffectType.healing: return healDescString(effect, stats);
        case EffectType.buff: return buffOrDebuffDescString(effect, stats);
        case EffectType.debuff: return buffOrDebuffDescString(effect, stats);
        case EffectType.hot: return hotDescString(effect, stats);
        case EffectType.dot: return dotDescString(effect, stats);
        case EffectType.threat: return threatDescString(effect, stats);
        default: console.log('omg'); return '';
    }
}

function aoeStringEnding(action: Action): string {
    const subject: string = action.intent === Intent.defense ? 'allies' : 'targets';
    if(action.burstRadius) {
        if(action.range > 0) {
            const burstAreaSize: number = (action.burstRadius * 2) + 1;
            return ` to ${subject} in a ${burstAreaSize}x${burstAreaSize} area`;
        }
        return ` to nearby ${subject}`;
    }
    if(action.target === 'line') return ' to targets on a line';
    return '';
}

function dmgDescString(effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean): string {
    if(effect.type !== 'damage') return '';
    const amount: string = effect.roll ? 
        rollString(effect, stats, hands, isWeapon ?? false) : flatAmountString(effect, stats, hands);
    const mpDmg: string = effect.targetStat === 'mp' ? ' to MP' : '';
    const pronoun: string = effect.targetsSelf ? ' to yourself' : '';
    return `deals ${amount} ${effect.dmgType} damage${mpDmg}${pronoun}`;
}

function healDescString(effect: Effect, stats: Stats | null): string {
    if(effect.type !== 'healing') return '';
    const targetStat: string = effectTargetStatString(effect.targetStat);
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
    const pronoun: string = effect.targetsSelf ? ' to you' : '';
    return `restores ${amount} ${targetStat}${pronoun}`;
}

function buffOrDebuffDescString(effect: Effect, stats: Stats | null): string {
    if(effect.type !== 'buff' && effect.type !== 'debuff')  return '';
    const qualifier: string = effect.type === 'buff' ? 'increases' : 'decreases';
    const pronoun: string = effect.targetsSelf ? 'your' : '';
    const targetStat: string = effectTargetStatString(effect.targetStat);
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
    return `${qualifier} ${pronoun} ${targetStat} by ${amount}`;
}

function hotDescString(effect: Effect, stats: Stats | null): string {
    if(effect.type !== 'hot') return '';
    const targetStat: string = effectTargetStatString(effect.targetStat);
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
    const pronoun: string = effect.targetsSelf ? 'to you' : '';
    return `restores ${amount} ${targetStat} ${pronoun}`
}

function dotDescString(effect: Effect, stats: Stats | null): string {
    if(effect.type !== 'dot') return '';
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1);
    const pronoun: string = effect.targetsSelf ? 'to you' : '';
    const mpDmg: string = effect.targetStat === 'mp' ? ' to MP' : '';
    return `deals ${amount} ${effect.dmgType} damage ${mpDmg} ${pronoun}`;
}

function threatDescString(effect: Effect, stats: Stats | null): string {
    if(effect.type !== 'threat') return '';
    const amount: string = effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1, false, true);
    const amountIsPositive: boolean = effect.flatAmount !== undefined && effect.flatAmount >= 0;
    const qualifier: string = amountIsPositive ? 'increases' : 'decreases';
    const pronoun: string = effect.targetsSelf ? 'your' : "the target's";
    return `${qualifier} ${pronoun} threat by ${amount}`;
}

export function dmgString(effect: Effect, stats: Stats | null): string {
    return effect.roll ? rollString(effect, stats, 1) : flatAmountString(effect, stats, 1, false, true)
}

function rollString(effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean): string {
    if(!effect.roll) return '';
    const bonus: number = (stats) ? getBonus(stats, effect, isWeapon ?? false, hands) : 0;
    const baseRollString: string = `${effect.roll.numDie}d${effect.roll.dieSides}`;
    const totalBonus: number = bonus + effect.roll.mod;
    return `${baseRollString}${totalBonus ? `+${totalBonus}` : ''}`;
}

function flatAmountString(
    effect: Effect, stats: Stats | null, hands: number, isWeapon?: boolean, returnAbs?: boolean
): string {
    if (effect.flatAmount === undefined) return '';
    let bonus: number = stats ? getBonus(stats, effect, isWeapon ?? false, hands ?? 1) : 0;
    if(effect.flatAmount < 0) bonus = -bonus;
    let amount: number = effect.flatAmount + bonus;
    if(returnAbs) amount = Math.abs(amount);
    return amount.toString();
}

/*function duration(effect: Effect): string {
    const per: string = ['hot','dot'].includes(effect.type) ? 'over' : 'for';
    return effect.duration ? ` ${per} ${effect.duration} rounds` : ''
}*/

function effectDurationString(effect: Effect): string {
    if(effect.duration === undefined || effect.duration === 0) return '';
    let qualifier: string = 'for';
    if(['hot','dot'].includes(effect.type) && effect.flatAmount) qualifier = 'over';
    return ` ${qualifier} ${effect.duration} rounds`;
}

function allDurationsEqual(action: Action): boolean {
    return action.effects.every(e => e.duration === action.effects[0].duration)
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
        case 'initiative': return 'Initiative';
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
        case 'allDr': return 'all DR';
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
        case 'fireAff': return 'Fire Affinity';
        case 'windAtk': return 'Wind Atk';
        case 'windDmg': return 'Wind Dmg'
        case 'windDr': return 'Wind DR';
        case 'windAff': return 'Wind Affinity';
        case 'earthAtk': return 'Earth Atk';
        case 'earthDmg': return 'Earth Dmg'
        case 'earthDr': return 'Earth DR';
        case 'earthAff': return 'Earth Affinity';
        case 'shadowAtk': return 'Shadow Atk';
        case 'shadowDmg': return 'Shadow Dmg'
        case 'shadowDr': return 'Shadow DR';
        case 'shadowAff': return 'Shadow Affinity';
        case 'waterAtk': return 'Water Atk';
        case 'waterDmg': return 'Water Dmg'
        case 'waterDr': return 'Water DR';
        case 'waterAff': return 'Water Affinity';
        case 'holyAtk': return 'Holy Atk';
        case 'holyDmg': return 'Holy Dmg'
        case 'holyDr': return 'Holy DR';
        case 'holyAff': return 'Holy Affinity';
        case 'poisonAtk': return 'Poison Atk';
        case 'poisonDmg': return 'Poison Dmg'
        case 'poisonDr': return 'Poison DR';
        case 'poisonAff': return 'Poison Affinity';
        case 'lightningAtk': return 'Lightning Atk';
        case 'lightningDmg': return 'Lightning Dmg'
        case 'lightningDr': return 'Lightning DR';
        case 'lightningAff': return 'Lightning Affinity';
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

export function weaponTypeString(weaponType: WeaponType | string): string {
    switch(weaponType) {
        case WeaponType.simpleMelee: return 'Simple melee';
        case WeaponType.martialMelee: return 'Martial melee';
        case WeaponType.simpleRanged: return 'Simple ranged';
        case WeaponType.martialRanged: return 'Martial ranged';
        case WeaponType.magicalMelee: return 'Magical melee';
        case WeaponType.magicalRanged: return 'Magical ranged';
        default: return 'nope';
    }
}

export function passiveEffectString(passive: PassiveEffect): string {
    const operator: string = passive.amount >= 0 ? '+' : '';
    if(passive.targetStat === EffectTargetStat.threatMultiplier) {
        return `${passiveEffectThreatString(passive.amount)} Threat`
    }
    return `${operator}${passive.amount} ${effectTargetStatString(passive.targetStat)}`;
}

export function attrReqString(attrReq: AttributeReq): string {
    return `${cap(attrReq.attr)} ${attrReq.minAttrValue}`
}

function passiveEffectThreatString(threatModifer: number): string {//threatMult mods on effects
    const operator: string = threatModifer >= 0 ? '+' : '';
    return `${operator}${threatModifer}%`;
}

export function charThreatString(threatMuliplier: number): string {//threatMult value on chars
    const diffValue: number = (threatMuliplier - 1) * 100;
    const operator: string = diffValue >= 0 ? '+' : '';
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