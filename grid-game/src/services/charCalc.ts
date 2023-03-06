import {
    Character, GameChar, Class, Stats, Attributes, Affinities, Armor, Weapon, Effect, 
    Passive, Action, Talent, PassiveEffect, InventoryItem
} from '../types/types';

import { ClassRole, CharType, DamageType, EffectType, EffectTargetStat, TargetStatType } from '../types/enums';

function fl(n: number): number {return Math.floor(n)}

const notPureStatKeys: string[] = ['strength', 'finesse', 'toughness', 'mind', 'spirit', 'fireAff', 
    'windAff', 'earthAff', 'shadowAff', 'waterAff', 'holyAff', 'poisonAff', 'lightningAff'];

export const baseClassAttrPointBuy: number = 4;
export const attrPointsPerLevel: number = 3;
export const levelsPerTalentTier: number = 2;

export function statCalc(character: Character): Character {
    const char: Character = {...character};
    const armorACBonus: number = getACBonus(char.inventory);
    const armorMACBonus: number = getMACBonus(char.inventory);
    const allPassives: PassiveEffect[] = getCharPassiveEffects(char.class, char.inventory, char.selectedTalents);
    const attributes: Attributes = createAttributes(char.pointBuy, char.class, char.level, allPassives);
    const affinities: Affinities = createAffinities(attributes, allPassives);

   return {
        ...char,
        actions: getCharActions(char),
        attributes: attributes,
        stats: createStats(attributes, affinities, armorACBonus, armorMACBonus, 
            char.level, allPassives)
   }
}

export function createAttributes(
    pointBuy: Attributes, charClass: Class, level: number, passives: PassiveEffect[]
): Attributes {
    let attributes: Attributes = {
        strength: pointBuy.strength + charClass.attributes.strength,
        finesse: pointBuy.finesse + charClass.attributes.finesse,
        toughness: pointBuy.toughness + charClass.attributes.toughness,
        mind: pointBuy.mind + charClass.attributes.mind,
        spirit: pointBuy.spirit + charClass.attributes.spirit
    }

    attributes[charClass.attributeFocus[0]] += level;
    attributes[charClass.attributeFocus[1]] += level;

    attributes = applyAttrPassives(attributes, passives);

    return attributes;
}

export function applyAttrPassives(
    attributes: Attributes, passiveEffects: PassiveEffect[]
): Attributes {
    for (let i = 0; i < passiveEffects.length; i++) {
        switch(passiveEffects[i].targetStat) {
            case 'strength': attributes.strength += passiveEffects[i].amount; break;
            case 'finesse': attributes.finesse += passiveEffects[i].amount; break;
            case 'toughness': attributes.toughness += passiveEffects[i].amount; break;
            case 'mind': attributes.mind += passiveEffects[i].amount; break;
            case 'spirit': attributes.spirit += passiveEffects[i].amount; break;
            default: break;
        }
    }
    return attributes;
}

export function createStats(
    attributes: Attributes, affinities: Affinities, armorACBonus: number, armorMACBonus: number, level: number,
    passiveEffects: PassiveEffect[]
): Stats {

    const str = attributes.strength, fin = attributes.finesse, tns = attributes.toughness;
    const min = attributes.mind, spt = attributes.spirit;

    let stats: Stats = {
        hp: 10 + fl(1.5 * tns) + fl(str / 4) + fl(1.5 * level),
        hpRegen: 1 + fl(spt / 6),
        mp: 10 + min + fl(1.5 * level),
        mpRegen: 1 + fl(spt / 4),
        ac: 10 + fl(fin / 4) + armorACBonus,
        mac: 10 + fl(spt / 4) + fl(min / 4) + fl(fin / 4) + armorMACBonus,
        ini: fl(fin / 3) + fl(min / 3),
        mvt: 3 + fl(str / 6) + fl(fin / 6),
        bonusHealingDone: fl(spt / 5),
        bonusHealingRcvd: fl(spt / 3),
        threatMultiplier: +(1 + (str / 150) + (min / 150) + (fin / 200)).toFixed(2),
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

    for (let p = 0; p < passiveEffects.length; p++) {
        if(!notPureStatKeys.includes(passiveEffects[p].targetStat)) {
            stats = applyStatEffect(stats, passiveEffects[p].targetStat, passiveEffects[p].amount)
        }
    }

    return stats;
}

export function createAffinities(attributes: Attributes, passives: PassiveEffect[]): Affinities {
    const affinities: Affinities = {
        fire: fl(attributes.strength / 4),
        wind: fl(attributes.finesse / 4),
        earth: fl(attributes.toughness / 4),
        shadow: fl(attributes.mind / 4),
        water: fl(attributes.spirit / 4),
        holy: fl((attributes.strength + attributes.spirit) / 8),
        poison: fl((attributes.toughness + attributes.mind) / 8),
        lightning: fl((attributes.finesse + attributes.mind) / 8)
    };

    const affinityEffects: PassiveEffect[] = passives.filter(
        p => p.targetStatType === TargetStatType.affinity)

    for (let i = 0; i < affinityEffects.length; i++) {
        switch(affinityEffects[i].targetStat) {
            case 'fireAff': affinities.fire += affinityEffects[i].amount; break;
            case 'windAff': affinities.wind += affinityEffects[i].amount; break;
            case 'earthAff': affinities.earth += affinityEffects[i].amount; break;
            case 'shadowAff': affinities.shadow += affinityEffects[i].amount; break;
            case 'waterAff': affinities.water += affinityEffects[i].amount; break;
            case 'holyAff': affinities.holy += affinityEffects[i].amount; break;
            case 'poisonAff': affinities.poison += affinityEffects[i].amount; break;
            case 'lightningAff': affinities.lightning += affinityEffects[i].amount; break;
            default: break;
        }
    }

    return affinities;
}

export function getACBonus(inventory: InventoryItem[]): number {
    let armorACBonus: number = 0;
    for (let i = 0; i < inventory.length; i++) {
        const armor: Armor | null = inventory[i].armor;
        if(armor) armorACBonus += armor.ac;
    }   
    return armorACBonus;
}

export function getMACBonus(inventory: InventoryItem[]): number {
    let armorMACBonus: number = 0;
    for (let i = 0; i < inventory.length; i++) {
        const armor: Armor | null = inventory[i].armor;
        if(armor) armorMACBonus += armor.mac;
    }   
    return armorMACBonus;
}

export function getCharActions(char: Character | GameChar): Action[] {
    const classActions: Action[] = char.class.startingActions;
    const talentActions: Action[] = getTalentActions(char.class.talents, char.selectedTalents);
    const gearActions: Action[] = getGearActions(char.inventory);

    return [...classActions, ...gearActions, ...talentActions];
}

export function getCharPassiveEffects(
    charClass: Class, inventory: InventoryItem[], selectedTalents: string[]
): PassiveEffect[] {
    const classPassives: PassiveEffect[] = charClass.passives.map(p => p.effects).flat(1);
    const talentPassives: PassiveEffect[] = getTalentPassiveEffects(charClass.talents, selectedTalents);
    const gearPassives: PassiveEffect[] = getGearPassiveEffects(inventory);

    return [...classPassives, ...gearPassives, ...talentPassives];
}

function getTalentPassiveEffects(classTalents: Talent[][], selectedTalents: string[]): PassiveEffect[] {
    let passives: PassiveEffect[] = [];
    for (let tier = 0; tier < selectedTalents.length; tier++) {
        const talentId: string = selectedTalents[tier];
        for (let t = 0; t < classTalents[tier].length; t++) {
            const thisTalent = classTalents[tier][t];
            if(thisTalent.passive && thisTalent.passive._id.toString() === talentId) {
                passives = [...passives, ...thisTalent.passive.effects]
            }
        }
    }
    return passives;
}

function getTalentActions(classTalents: Talent[][], selectedTalents: string[]): Action[] {
    const talentActions: Action[] = [];
    for (let tier = 0; tier < selectedTalents.length; tier++) {
        const talentId: string = selectedTalents[tier];
        for (let t = 0; t < classTalents[tier].length; t++) {
            const thisTalent: Talent = classTalents[tier][t];
            if(thisTalent.action && thisTalent.action._id.toString() === talentId) {
                talentActions.push(thisTalent.action)
            }
        }
    }
    return talentActions;
}

function getGearPassiveEffects(inventory: InventoryItem[]): PassiveEffect[] {
    let gearPassiveEffects: PassiveEffect[] = [];
    for (let i = 0; i < inventory.length; i++) {
        const armor: Armor | null = inventory[i].armor;
        const weapon: Weapon | null = inventory[i].weapon;
        if(armor) gearPassiveEffects = [...gearPassiveEffects, ...armor.passives];
        if(weapon) gearPassiveEffects = [...gearPassiveEffects, ...weapon.passives];
    }
    return gearPassiveEffects;
}

function getGearActions(inventory: InventoryItem[]): Action[] {
    let gearActions: Action[] = [];
    for (let i = 0; i < inventory.length; i++) {
        const thisItem: InventoryItem = inventory[i];
        if(thisItem.weapon) {
            gearActions.push(thisItem.weapon.action);
            gearActions = [...gearActions, ...thisItem.weapon.otherActions];
        }
        if(thisItem.armor) gearActions = [...gearActions, ...thisItem.armor.actions];
    }
    return gearActions;
}

export function getCharWeapons(inventory: InventoryItem[]): Weapon[] {
    const weapons: Weapon[] = [];
    for (let i = 0; i < inventory.length; i++) {
        const thisItem: InventoryItem = inventory[i];
        if(thisItem.weapon) weapons.push(thisItem.weapon);
    }
    return weapons;
}

export function newInventory(charClass: Class): InventoryItem[] {
    const inventory: InventoryItem[] = [];
    const sharedInvProps = {isStackable: false, qty: 1, isEquipped: true}

    for (let i = 0; i < charClass.startingWeapons.length; i++) {
        const thisWeapon: Weapon = charClass.startingWeapons[i];
        inventory.push({...sharedInvProps, weapon: thisWeapon, armor: null, item: null});
    }

    for (let i = 0; i < charClass.startingArmor.length; i++) {
        const thisArmor: Armor = charClass.startingArmor[i];
        inventory.push({...sharedInvProps, weapon: null, armor: thisArmor, item: null});
    }

    return inventory;
}

//used for both Characters and GameChars
//'threat' effects will never hit this - they occur only in-game and are not a buff/debuff
export function applyStatEffect(stats: Stats, targetStat: EffectTargetStat, effectAmount: number): Stats {
    switch(targetStat) {
        case 'ac': stats.ac += effectAmount; break;
        case 'mac': stats.mac += effectAmount; break;
        case 'mvt': if(stats.mvt + effectAmount > 0) {stats.mvt += effectAmount} else {stats.mvt = 0} break;
        case 'hpRegen': stats.hpRegen = neverNegative(stats.hpRegen + effectAmount); break;
        case 'mpRegen': stats.mpRegen = neverNegative(stats.mpRegen + effectAmount); break;
        case 'initiative': stats.ini += effectAmount; break;
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
        case 'threatMultiplier': stats.threatMultiplier = neverNegative(
            stats.threatMultiplier + (effectAmount / 100)); break;
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
        default: console.log(`cannot applyStatEffect to ${targetStat}!`);
    }

    return stats;
}

//only affects GameChars!
export function applyAttrEffect(char: GameChar, attrKey: keyof Attributes, amount: number): GameChar {
    const originalHp: number = char.game.stats.hp, originalMp: number = char.game.stats.mp;

    const attributes: Attributes = char.game.attributes;
    attributes[attrKey] += amount;

    const allPassives: PassiveEffect[] = getCharPassiveEffects(char.class, char.inventory, char.selectedTalents);
    const affinities: Affinities = createAffinities(attributes, allPassives);
    
    char.game.stats = createStats(attributes, affinities, getACBonus(char.inventory), 
        getMACBonus(char.inventory), char.level, allPassives);
    char.game.stats.hp = originalHp;
    char.game.stats.mp = originalMp;

    return char;
}

//only affects GameChars!
export function applyAffinityEffect(char: GameChar, attrKey: keyof Affinities, amount: number): GameChar {
    const originalHp: number = char.game.stats.hp, originalMp: number = char.game.stats.mp;

    const allPassives: PassiveEffect[] = getCharPassiveEffects(char.class, char.inventory, char.selectedTalents);
    const affinities: Affinities = createAffinities(char.attributes, allPassives);
    affinities[attrKey] += amount;

    char.game.stats = createStats(char.attributes, affinities, getACBonus(char.inventory), 
        getMACBonus(char.inventory), char.level, allPassives);
    char.game.stats.hp = originalHp;
    char.game.stats.mp = originalMp;

    return char;
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
    const elementalTypes: DamageType[] = [
        DamageType.fire, DamageType.wind, DamageType.earth, DamageType.shadow, DamageType.water, 
        DamageType.holy, DamageType.poison
    ];
    return elementalTypes.includes(dmgType);
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

export function blankChar(classData: Class[]): Character {
    const attributes: Attributes = {
        strength: 0,
        finesse: 0,
        toughness: 0,
        mind: 0,
        spirit: 0
    };

    const classPassiveEffects: PassiveEffect[] = classData[0].passives.map(p => p.effects).flat(1);
    const affinities: Affinities = createAffinities(attributes, classPassiveEffects);

    const char: Character = {
        _id: '',
        color: '#ffffff',
        name: '(click to name me)',
        class: classData[0],
        level: 1,
        xp: 0,
        type: CharType.player,
        attributes:attributes,
        pointBuy: attributes,
        stats: createStats(attributes, affinities, 0, 0, 1, []),
        actions: [],
        selectedTalents: [],
        inventory: []
    }

    return {...char, actions: getCharActions(char)}
}

export function blankClass(): Class {
    return {
        _id: '',
        name: "(click to name me)",
        role: ClassRole.melee,
        desc: '',
        attributes: {
            strength: 0,
            finesse: 0,
            toughness: 0,
            mind: 0,
            spirit: 0
        },
        attributeFocus: ['strength','toughness'],
        armorProfs: [],
        weaponProfs: [],
        startingWeapons: [],
        startingArmor: [],
        startingActions: [],
        passives: [],
        availableInGame: true,
        talents: blankClassTalents()
    }
}

export function blankClassPassive(): Passive {
    return {
        _id: '',
        name: 'New Passive',
        dmgType: DamageType.magic,
        effects: [
            {
                targetStat: EffectTargetStat.ac,
                amount: 1,
                targetStatType: TargetStatType.stat
            }
        ]
    }
}

function blankClassTalents(): any[][] {
    return Array(Math.ceil(20 / (levelsPerTalentTier + 1))).fill([])
}