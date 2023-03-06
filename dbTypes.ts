import {Attributes, AttributeFocus } from './grid-game/src/types/types';
import { CharType, ClassRole, WeaponType, ArmorType } from './grid-game/src/types/enums';

export interface DbClass {
    _id?: string;
    name: string;
    role: ClassRole;
    desc: string;
    attributes: Attributes;
    attributeFocus: AttributeFocus;
    armorProfs: ArmorType[];
    weaponProfs: WeaponType[];
    startingWeapons: string[];
    startingArmor: string[];
    startingActions: string[];
    passives: string[];
    availableInGame: boolean;
    talents: DbTalent[][];
}

export interface DbCharacter {
    _id?: string;
    color: string;
    name: string;
    class: string;
    level: number;
    xp: number;
    type: CharType;
    pointBuy: Attributes;
    selectedTalents: string[];
    inventory: DbInventoryItem[];
}

export interface DbParty {
    _id?: string;
    members: string[];
}

export interface DbTalent {
    passiveId: string | null;
    actionId: string | null;
}

export interface DbInventoryItem {
    isStackable: boolean;
    qty: number;
    isEquipped: boolean;
    weaponId: string | null;
    armorId: string | null;
    itemId: string | null;
}
