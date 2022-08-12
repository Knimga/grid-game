import {Attributes, CharType, AttributeFocus, ClassRole, BoardChar} from './grid-game/src/types';

export interface DbClass {
    _id?: string;
    name: string;
    role: ClassRole;
    attributes: Attributes;
    attributeFocus: AttributeFocus;
    armor: string[];
    actions: string[];
}

export interface DbCharacter {
    _id?: string;
    color: string;
    name: string;
    class: string;
    level: number;
    type: CharType;
    pointBuy: Attributes;
}

interface DbBoard {
    _id?: string;
    name: string;
    gridWidth: number;
    gridHeight: number;
    walls: number[];
    chars: BoardChar[];
}