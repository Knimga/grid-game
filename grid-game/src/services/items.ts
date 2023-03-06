import { blankAction } from "./actions";

import { Weapon, Armor, AttributeReq, PassiveEffect, Action } from "../types/types";
import { EffectTargetStat, TargetStatType, WeaponType, ArmorType } from "../types/enums";

export function blankPassive(): PassiveEffect {
    return {targetStat: EffectTargetStat.ac, targetStatType: TargetStatType.stat, amount: 1}
}

export function blankAttrReq(): AttributeReq {return {attr: 'strength', minAttrValue: 2}}

export function blankWeapon(): Weapon {
    return {
        name: 'new weapon',
        type: WeaponType.simpleMelee,
        hands: 1,
        isStartingWeapon: false,
        action: blankWeaponAction(),
        otherActions: [],
        attrReqs: [],
        passives: []
    }
}

export function blankArmor(): Armor {
    return {
        name: 'new armor',
        type: ArmorType.light,
        ac: 1,
        mac: 1,
        actions: [],
        attrReqs: [],
        passives: [],
        isStartingArmor: false
    }
}

function blankWeaponAction(): Action {
    return {...blankAction('new weapon'), isWeapon: true, hands: 1}
}