import {
    Character, Class, ClassRole, CharType, Stats, DamageType, 
    Attributes, Armor, Effect, EffectType
} from '../types';

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

export function createStats(attributes: Attributes, armorACBonus: number, armorMACBonus: number, level: number): Stats {
    function fl(n: number): number {return Math.floor(n)}
    return {
        hp: 10 + fl(1.5 * attributes.toughness) + fl(0.25 * attributes.strength) + fl(1.5 * level),
        hpRegen: 1 + fl(attributes.spirit / 6),
        mp: 10 + attributes.mind + fl(1.5 * level),
        mpRegen: 1 + fl(0.25 * attributes.spirit),
        ac: 10 + fl(0.25 * attributes.finesse) + armorACBonus,
        mac: 10 + fl(attributes.spirit / 3) + fl(0.25 * attributes.mind) + fl(0.25 * attributes.finesse) + armorMACBonus,
        ini: fl(0.5 * attributes.finesse) + fl(0.5 * attributes.mind),
        mvt: 3 + fl(0.25 * attributes.strength) + fl(0.25 * attributes.finesse),
        bonusHealingDone: fl(attributes.spirit / 3),
        bonusHealingRcvd: fl(attributes.spirit / 3),
        dmgTypes: {
            melee: {
                atk: fl(0.75 * attributes.strength) + fl(0.5 * attributes.finesse),
                dmg: fl(attributes.strength / 3),
                dr: fl(0.25 * attributes.toughness)
             },
             ranged: {
                 atk: fl(0.5 * attributes.finesse),
                 dmg: fl(attributes.finesse / 3),
                 dr: fl(0.25 * attributes.toughness)
             },
             magic: {
                 atk: fl(0.25 * attributes.finesse) + fl(0.5 * attributes.mind),
                 dmg: fl(0.25 * attributes.mind),
                 dr: fl(0.25 * attributes.spirit)
             },
             fire: {
                 atk: fl(0.25 * attributes.strength),
                 dmg: fl(0.25 * attributes.strength),
                 dr: fl(0.25 * attributes.strength)
             },
             wind: {
                 atk: fl(0.25 * attributes.finesse),
                 dmg: fl(0.25 * attributes.finesse),
                 dr: fl(0.25 * attributes.finesse)
             },
             earth: {
                 atk: fl(0.25 * attributes.toughness),
                 dmg: fl(0.25 * attributes.toughness),
                 dr: fl(0.25 * attributes.toughness)
             },
             shadow: {
                 atk: fl(0.25 * attributes.mind),
                 dmg: fl(0.25 * attributes.mind),
                 dr: fl(0.25 * attributes.mind)
             },
             water: {
                 atk: fl(0.25 * attributes.spirit),
                 dmg: fl(0.25 * attributes.spirit),
                 dr: fl(0.25 * attributes.spirit)
             },
             holy: {
                atk: fl(attributes.spirit / 6) + fl(attributes.strength / 6),
                dmg: fl(attributes.spirit / 6) + fl(attributes.strength / 6),
                dr: fl(attributes.spirit / 6) + fl(attributes.strength / 6)
            },
            poison: {
                atk: fl(attributes.toughness / 6) + fl(attributes.finesse / 6),
                dmg: fl(attributes.toughness / 6) + fl(attributes.finesse / 6),
                dr: fl(attributes.toughness / 6) + fl(attributes.finesse / 6)
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

export function getBonus(stats: Stats, effect: Effect): number {
    switch(effect.type) {
        case EffectType.damage: return getDmgBonus(stats, effect.dmgType);
        case EffectType.healing: return getHealingBonus(stats, effect.dmgType);
        case EffectType.buff: return getBuffDebuffBonus(stats, effect.dmgType);
        case EffectType.debuff: return getBuffDebuffBonus(stats, effect.dmgType);
        case EffectType.dot: return getDmgBonus(stats, effect.dmgType);
        case EffectType.hot: return getHealingBonus(stats, effect.dmgType);
        default: console.log('no effect type!'); return 0;
    }
}

export function getDmgBonus(stats: Stats, dmgType: DamageType): number {
    const typeDmgBonus: number = stats.dmgTypes[dmgType].dmg;
    const magicDmgBonus: number = isElemental(dmgType) ? stats.dmgTypes.magic.dmg : 0;
    return typeDmgBonus + magicDmgBonus;
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

export function blankChar(classData: Class[]): Character | null {
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
