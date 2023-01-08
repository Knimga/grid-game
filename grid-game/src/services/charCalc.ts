import {
    Character, Class, ClassRole, CharType, Stats, DamageType, 
    Attributes, Affinities, Armor, Effect, EffectType
} from '../types';

function fl(n: number): number {return Math.floor(n)}

export function statCalc(character: Character): Character {
    const char: Character = {...character};
    const armorACBonus: number = getACBonus(char.armor);
    const armorMACBonus: number = getMACBonus(char.armor);
    const attributes: Attributes = createAttributes(char.pointBuy, char.class, char.level);

   return {
       ...char,
       attributes: attributes,
       stats: createStats(attributes, armorACBonus, armorMACBonus, char.level),
       actions: char.class.actions,
       armor: char.class.armor
   }
}

export function createAttributes(pointBuy: Attributes, charClass: Class, level: number): Attributes {
    const attributes: Attributes = {
        strength: pointBuy.strength + charClass.attributes.strength,
        finesse: pointBuy.finesse + charClass.attributes.finesse,
        toughness: pointBuy.toughness + charClass.attributes.toughness,
        mind: pointBuy.mind + charClass.attributes.mind,
        spirit: pointBuy.spirit + charClass.attributes.spirit
    }
    charClass.attributeFocus.forEach(attr => attributes[attr] += level);
    return attributes;
}

export function createStats(
    attributes: Attributes, armorACBonus: number, armorMACBonus: number, level: number
): Stats {

    const str = attributes.strength, fin = attributes.finesse, tns = attributes.toughness;
    const min = attributes.mind, spt = attributes.spirit;
       
    const affinities: Affinities = {
        fire: fl(str / 4),
        wind: fl(fin / 4),
        earth: fl(tns / 4),
        shadow: fl(min / 4),
        water: fl(spt / 4),
        holy: fl((spt + str) / 6),
        poison: fl((tns + fin) / 6)
    }

    return {
        hp: 10 + fl(1.5 * tns) + fl(str / 4) + fl(1.5 * level),
        hpRegen: 1 + fl(spt / 6),
        mp: 10 + min + fl(1.5 * level),
        mpRegen: 1 + fl(spt / 4),
        ac: 10 + fl(fin / 4) + armorACBonus,
        mac: 10 + fl(spt / 3) + fl(min / 4) + fl(fin / 4) + armorMACBonus,
        ini: fl(fin / 2) + fl(min / 2),
        mvt: 3 + fl(str / 6) + fl(fin / 6),
        bonusHealingDone: fl(spt / 5),
        bonusHealingRcvd: fl(spt / 3),
        affinities: {
            fire: fl(str / 4),
            wind: fl(fin / 4),
            earth: fl(tns / 4),
            shadow: fl(min / 4),
            water: fl(spt / 4),
            holy: fl(spt / 6) + fl(str / 6),
            poison: fl(tns / 6) + fl(fin / 6)
        },
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
            }
        }
    }
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

export function getBonus(stats: Stats, effect: Effect, isWeapon: boolean, hands: number): number {
    switch(effect.type) {
        case EffectType.damage: return getDmgBonus(stats, effect.dmgType, isWeapon, hands ?? 1);
        case EffectType.healing: return getHealingBonus(stats, effect.dmgType);
        case EffectType.buff: return getBuffDebuffBonus(stats, effect.dmgType);
        case EffectType.debuff: return getBuffDebuffBonus(stats, effect.dmgType);
        case EffectType.dot: return getDmgBonus(stats, effect.dmgType, isWeapon, hands ?? 1);
        case EffectType.hot: return getHealingBonus(stats, effect.dmgType);
        default: console.log('no effect type!'); return 0;
    }
}

export function getDmgBonus(stats: Stats, dmgType: DamageType, isWeapon: boolean, hands: number): number {
    const handsMultiplier: number = (hands && hands > 1) ? 1.5 : 1;
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

export function isElemental(dmgType: DamageType): boolean {
    const magicTypes: DamageType[] = [
        DamageType.fire, DamageType.wind, DamageType.earth, DamageType.shadow, DamageType.water, 
        DamageType.holy, DamageType.poison
    ];
    return magicTypes.includes(dmgType);
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
        type: CharType.player,
        attributes:attributes,
        pointBuy: attributes,
        stats: createStats(attributes, 0, 0, 1),
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
        actions: []
    }
}
