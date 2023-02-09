import {Character, GameChar, Class, Stats, Attributes, Affinities, Armor, Effect, PassiveEffect } from '../types/types';
import { ClassRole, CharType, DamageType, EffectType, EffectTargetStat, AttributeEnum } from '../types/enums';

function fl(n: number): number {return Math.floor(n)}

const attrKeys: string[] = Object.keys(AttributeEnum);

export function statCalc(character: Character): Character {
    const char: Character = {...character};
    const armorACBonus: number = getACBonus(char.armor);
    const armorMACBonus: number = getMACBonus(char.armor);
    const attributes: Attributes = createAttributes(char.pointBuy, char.class, char.level);

   return {
       ...char,
       attributes: attributes,
       stats: createStats(attributes, armorACBonus, armorMACBonus, char.level, char.class.passives),
       actions: char.class.actions,
       armor: char.class.armor
   }
}

export function createAttributes(pointBuy: Attributes, charClass: Class, level: number): Attributes {
    const passives: PassiveEffect[] = charClass.passives;
    const attributes: Attributes = {
        strength: pointBuy.strength + charClass.attributes.strength,
        finesse: pointBuy.finesse + charClass.attributes.finesse,
        toughness: pointBuy.toughness + charClass.attributes.toughness,
        mind: pointBuy.mind + charClass.attributes.mind,
        spirit: pointBuy.spirit + charClass.attributes.spirit
    }
    charClass.attributeFocus.forEach(attr => attributes[attr] += level);

    for (let p = 0; p < passives.length; p++) {
        for (let i = 0; i < passives[p].effects.length; i++) {
            switch(passives[p].effects[i].targetStat) {
                case 'strength': attributes.strength += passives[p].effects[i].amount; break;
                case 'finesse': attributes.finesse += passives[p].effects[i].amount; break;
                case 'toughness': attributes.toughness += passives[p].effects[i].amount; break;
                case 'mind': attributes.mind += passives[p].effects[i].amount; break;
                case 'spirit': attributes.spirit += passives[p].effects[i].amount; break;
                default: break;
            }
        }
    }

    return attributes;
}

export function createStats(
    attributes: Attributes, armorACBonus: number, armorMACBonus: number, level: number,
    passives: PassiveEffect[]
): Stats {

    const str = attributes.strength, fin = attributes.finesse, tns = attributes.toughness;
    const min = attributes.mind, spt = attributes.spirit;
       
    const affinities: Affinities = {
        fire: fl(str / 4),
        wind: fl(fin / 4),
        earth: fl(tns / 4),
        shadow: fl(min / 4),
        water: fl(spt / 4),
        holy: fl((str + spt) / 8),
        poison: fl((fin + tns) / 8),
        lightning: fl((fin + min) / 8)
    }

    let stats: Stats = {
        hp: 10 + fl(1.5 * tns) + fl(str / 4) + fl(1.5 * level),
        hpRegen: 1 + fl(spt / 6),
        mp: 10 + min + fl(1.5 * level),
        mpRegen: 1 + fl(spt / 4),
        ac: 10 + fl(fin / 4) + armorACBonus,
        mac: 10 + fl(spt / 4) + fl(min / 4) + fl(fin / 4) + armorMACBonus,
        ini: fl(fin / 2) + fl(min / 2),
        mvt: 3 + fl(str / 6) + fl(fin / 6),
        bonusHealingDone: fl(spt / 5),
        bonusHealingRcvd: fl(spt / 3),
        threatMultiplier: 1 + (str / 150) + (min / 150),
        dmgTypes: {
            melee: {
                atk: fl(0.75 * str) + fl(fin / 2),
                dmg: fl(str / 3),
                dr: fl(tns / 5)
            },
            ranged: {
                atk: fl(fin / 2),
                dmg: fl(fin / 3),
                dr: fl((tns + fin) / 8)
            },
            magic: {
                atk: fl(fin / 4) + fl(min / 2),
                dmg: fl(min / 4),
                dr: fl(spt / 5)
            },
            fire: {
                atk: affinities.fire,
                dmg: affinities.fire,
                dr: fl(affinities.fire / 2)
            },
            wind: {
                atk: affinities.wind,
                dmg: affinities.wind,
                dr: fl(affinities.wind / 2)
            },
            earth: {
                atk: affinities.earth,
                dmg: affinities.earth,
                dr: fl(affinities.earth / 2)
            },
            shadow: {
                atk: affinities.shadow,
                dmg: affinities.shadow,
                dr: fl(affinities.shadow / 2)
            },
            water: {
                atk: affinities.water,
                dmg: affinities.water,
                dr: fl(affinities.water / 2)
            },
            holy: {
                atk: affinities.holy,
                dmg: affinities.holy,
                dr: fl(affinities.holy / 2)
            },
            poison: {
                atk: affinities.poison,
                dmg: affinities.poison,
                dr: fl(affinities.poison / 2)
            },
            lightning: {
                atk: affinities.lightning,
                dmg: affinities.lightning,
                dr: fl(affinities.lightning / 2)
            }
        }
    }

    for (let p = 0; p < passives.length; p++) {
        for (let e = 0; e < passives[p].effects.length; e++) {
            if(!attrKeys.includes(passives[p].effects[e].targetStat)) {
                stats = applyStatEffect(stats, passives[p].effects[e].targetStat, passives[p].effects[e].amount)
            }
        }
    }

    return stats;
}

export function getACBonus(armor: Armor[]): number {
    let armorACBonus: number = 0;
    for (let i = 0; i < armor.length; i++) armorACBonus += armor[i].ac;
    return armorACBonus;
}

export function getMACBonus(armor: Armor[]): number {
    let armorMACBonus: number = 0;
    for (let i = 0; i < armor.length; i++) armorMACBonus += armor[i].mac;
    return armorMACBonus;
}

export function applyStatEffect(stats: Stats, targetStat: EffectTargetStat, effectAmount: number): Stats {
    //'threat' effects will never hit this! They are not a buff or debuff
    switch(targetStat) {
        case 'ac': stats.ac += effectAmount; break;
        case 'mac': stats.mac += effectAmount; break;
        case 'mvt': if(stats.mvt + effectAmount > 0) {stats.mvt += effectAmount} else {stats.mvt = 0} break;
        case 'hpRegen': stats.hpRegen += effectAmount; break;
        case 'mpRegen': stats.mpRegen += effectAmount; break;
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
        case 'threatMultiplier': stats.threatMultiplier += effectAmount; break;
        case 'meleeAtk': stats.dmgTypes.melee.atk += effectAmount; break;
        case 'meleeDmg': stats.dmgTypes.melee.dmg += effectAmount; break;
        case 'meleeDr': stats.dmgTypes.melee.dr += effectAmount; break;
        case 'rangedAtk': stats.dmgTypes.ranged.atk += effectAmount; break;
        case 'rangedDmg': stats.dmgTypes.ranged.dmg += effectAmount; break;
        case 'rangedDr': stats.dmgTypes.ranged.dr += effectAmount; break;
        case 'magicAtk': stats.dmgTypes.magic.atk += effectAmount; break;  
        case 'magicDmg': stats.dmgTypes.magic.dmg += effectAmount; break;
        case 'magicDr': stats.dmgTypes.magic.dr += effectAmount; break;
        case 'fireAtk': stats.dmgTypes.fire.atk += effectAmount; break;
        case 'fireDmg': stats.dmgTypes.fire.dmg += effectAmount; break;
        case 'fireDr': stats.dmgTypes.fire.dr += effectAmount; break;
        case 'windAtk': stats.dmgTypes.wind.atk += effectAmount; break;
        case 'windDmg': stats.dmgTypes.wind.dmg += effectAmount; break;
        case 'windDr': stats.dmgTypes.wind.dr += effectAmount; break;
        case 'earthAtk': stats.dmgTypes.earth.atk += effectAmount; break;
        case 'earthDmg': stats.dmgTypes.earth.dmg += effectAmount; break;
        case 'earthDr': stats.dmgTypes.earth.dr += effectAmount; break;
        case 'shadowAtk': stats.dmgTypes.shadow.atk += effectAmount; break;
        case 'shadowDmg': stats.dmgTypes.shadow.dmg += effectAmount; break;
        case 'shadowDr': stats.dmgTypes.shadow.dr += effectAmount; break;
        case 'waterAtk': stats.dmgTypes.water.atk += effectAmount; break;
        case 'waterDmg': stats.dmgTypes.water.dmg += effectAmount; break;
        case 'waterDr': stats.dmgTypes.water.dr += effectAmount; break;
        case 'holyAtk': stats.dmgTypes.holy.atk += effectAmount; break;
        case 'holyDmg': stats.dmgTypes.holy.dmg += effectAmount; break;
        case 'holyDr': stats.dmgTypes.holy.dr += effectAmount; break;
        case 'poisonAtk': stats.dmgTypes.poison.atk += effectAmount; break;
        case 'poisonDmg': stats.dmgTypes.poison.dmg += effectAmount; break;
        case 'poisonDr': stats.dmgTypes.poison.dr += effectAmount; break;
        case 'lightningAtk': stats.dmgTypes.lightning.atk += effectAmount; break;
        case 'lightningDmg': stats.dmgTypes.lightning.dmg += effectAmount; break;
        case 'lightningDr': stats.dmgTypes.lightning.dr += effectAmount; break;
        case 'bonusHealingDone': stats.bonusHealingDone += effectAmount; break;
        case 'bonusHealingRcvd': stats.bonusHealingRcvd += effectAmount; break;
        default: console.log('no targetStat!');
    }

    return stats;
}

export function getBonus(stats: Stats, effect: Effect, isWeapon: boolean, hands: number): number {
    switch(effect.type) {
        case EffectType.damage: return getDmgBonus(stats, effect.dmgType, isWeapon, hands);
        case EffectType.healing: return getHealingBonus(stats, effect.dmgType);
        case EffectType.buff: return getBuffDebuffBonus(stats, effect.dmgType);
        case EffectType.debuff: return getBuffDebuffBonus(stats, effect.dmgType);
        case EffectType.dot: return getDmgBonus(stats, effect.dmgType, isWeapon, hands);
        case EffectType.hot: return getHealingBonus(stats, effect.dmgType);
        case EffectType.threat: return getThreatBonus(stats, effect.dmgType);
        default: console.log('no effect type!'); return 0;
    }
}

export function getDmgBonus(stats: Stats, dmgType: DamageType, isWeapon: boolean, hands: number): number {
    const handsMultiplier: number = hands > 1 ? 1.5 : 1;
    const typeDmgBonus: number = stats.dmgTypes[dmgType].dmg;
    const magicDmgBonus: number = (!isWeapon && isElemental(dmgType)) ? stats.dmgTypes.magic.dmg : 0;
    return fl((typeDmgBonus + magicDmgBonus) * handsMultiplier);
}

export function getAtkBonus(stats: Stats, dmgType: DamageType): number {
    const typeAtkBonus: number = stats.dmgTypes[dmgType].atk;
    const magicAtkBonus: number = isElemental(dmgType) ? stats.dmgTypes.magic.atk : 0;
    return typeAtkBonus + magicAtkBonus;
}

export function getHealingBonus(stats: Stats, dmgType: DamageType): number {
    return stats.dmgTypes[dmgType].dmg + stats.bonusHealingDone
}

export function getBuffDebuffBonus(stats: Stats, dmgType: DamageType): number {
    return Math.floor(0.5 * stats.dmgTypes[dmgType].dmg)
}

export function getThreatBonus(stats: Stats, dmgType: DamageType): number {
    return stats.dmgTypes[dmgType].dmg
}

export function isElemental(dmgType: DamageType): boolean {
    const magicTypes: DamageType[] = [
        DamageType.fire, DamageType.wind, DamageType.earth, DamageType.shadow, DamageType.water, 
        DamageType.holy, DamageType.poison
    ];
    return magicTypes.includes(dmgType);
}

export function isMagic(dmgType: DamageType): boolean {
    const magicTypes: DamageType[] = [
        DamageType.fire, DamageType.wind, DamageType.earth, DamageType.shadow, DamageType.water, 
        DamageType.holy, DamageType.poison, DamageType.magic
    ];
    return magicTypes.includes(dmgType);
}

export function neverNegative(n: number): number {return n < 0 ? 0 : n}
export function never0(n: number): number {return n < 1 ? 1 : n}

//only affects game data!
export function applyAttrEffect(char: GameChar, attrKey: keyof Attributes, amount: number): GameChar {
    const originalHp: number = char.game.stats.hp, originalMp: number = char.game.stats.mp;

    char.game.attributes[attrKey] += amount;
    char.game.stats = createStats(char.game.attributes, getACBonus(char.armor), getMACBonus(char.armor), 
        char.level, char.class.passives);
    char.game.stats.hp = originalHp;
    char.game.stats.mp = originalMp;

    return char;
}

export function blankChar(classData: Class[]): Character {
    const attributes: Attributes = {
        strength: 0,
        finesse: 0,
        toughness: 0,
        mind: 0,
        spirit: 0
    };

    return {
        _id: '',
        color: '#ffffff',
        name: '(click to name me)',
        class: classData[0],
        level: 1,
        xp: 0,
        type: CharType.player,
        attributes:attributes,
        pointBuy: attributes,
        stats: createStats(attributes, 0, 0, 1, []),
        actions: [],
        armor: []
    }
}

export function blankClass(): Class {
    return {
        _id: '',
        name: "(click to name me)",
        role: ClassRole.melee,
        attributes: {
            strength: 0,
            finesse: 0,
            toughness: 0,
            mind: 0,
            spirit: 0
        },
        attributeFocus: ['strength','toughness'],
        armor: [],
        actions: [],
        passives: [],
        availableInGame: true
    }
}
