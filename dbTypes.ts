import {Attributes, AttributeFocus, PassiveEffect } from './grid-game/src/types/types';
import { CharType, ClassRole } from './grid-game/src/types/enums';

export interface DbClass {
    _id?: string;
    name: string;
    role: ClassRole;
    attributes: Attributes;
    attributeFocus: AttributeFocus;
    armor: string[];
    actions: string[];
    passives: PassiveEffect[];
    availableInGame: boolean;
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
}

export interface DbParty {
    _id?: string;
    members: string[];
}