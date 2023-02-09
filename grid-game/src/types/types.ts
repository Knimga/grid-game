import { 
    CharType, ClassRole, Intent, DamageType, TargetingType, 
    EffectType, EffectTargetStat 
} from "./enums";

export interface Dungeon {
    _id?: string;
    name: string;
    floorColor: string;
    wallColor: string;
    boards: Board[];
}

export interface Board {
    id: string;
    name: string;
    gridWidth: number;
    gridHeight: number;
    portal?: number;
    doors: Door[];
    walls: number[];
    chars: BoardChar[];
}

export interface Door {
    id: string;
    name: DoorName;
    position: number;
    leadsTo: {boardId: string; doorId: string;}
}

export type DoorName = [string, string, string];

export interface BoardChar {
    _id: string; 
    index: number;
    name: string;
    color: string;
    isBoss?: boolean;
}

export interface GameDungeon extends Omit<Dungeon, 'boards'> {
    boards: GameBoard[];
}

export interface GameBoard extends Omit<Board, 'chars'> {
    chars: GameChar[];
    exploredAreas: number[];
}

export interface Meters {
    dmgDone: number;
    dmgTaken: number;
    healingDone: number;
    statEffectsDone: number;
    threat: number;
}

export interface Character {
    _id: string;
    color: string;
    name: string;
    class: Class;
    level: number;
    type: CharType;
    xp: number;
    attributes: Attributes;
    pointBuy: Attributes;
    stats: Stats;
    actions: Action[];
    armor: Armor[];
}

export interface GameChar extends Character {
    game: {
        gameId: string;
        positionIndex: number;
        iniRoll: number;
        isTurn: boolean;
        attributes: Attributes;
        stats: Stats;
        round: {
            movementTaken: number;
            actionTaken: boolean;
        };
        meters: Meters;
        isVisible: boolean;
        hasBeenSeen: boolean;
        activeEffects: ActiveEffect[];
        destinationIndex?: number; //for enemies only
        isBoss?: boolean; //for enemies only
    }
}

export interface Class {
    _id?: string;
    name: string;
    role: ClassRole;
    attributes: Attributes;
    attributeFocus: AttributeFocus;
    armor: Armor[];
    actions: Action[];
    passives: PassiveEffect[];
    availableInGame: boolean;
}

export type AttributeFocus = [keyof Attributes, keyof Attributes];

export interface PassiveEffect {
    name: string;
    dmgType: DamageType;
    effects: {targetStat: EffectTargetStat; amount: number;}[]
}

export interface Attributes {
    strength: number;
    finesse: number;
    toughness: number;
    mind: number;
    spirit: number;
}

export interface Stats {
    hp: number;
    hpRegen: number;
    mp: number;
    mpRegen: number;
    ac: number;
    mac: number;
    ini: number;
    mvt: number;
    bonusHealingDone: number;
    bonusHealingRcvd: number;
    dmgTypes: DamageTypes;
    threatMultiplier: number;
}

export interface Affinities {
    fire: number;
    wind: number;
    earth: number;
    shadow: number;
    water: number;
    holy: number;
    poison: number;
    lightning: number;
}

export interface DamageTypes {
    melee: Bonuses;
    ranged: Bonuses;
    magic: Bonuses;
    fire: Bonuses;
    wind: Bonuses;
    earth: Bonuses;
    shadow: Bonuses;
    water: Bonuses;
    holy: Bonuses;
    poison: Bonuses;
    lightning: Bonuses;
}

export interface Bonuses {atk: number; dmg: number; dr: number;}

export interface Armor {
    _id: string,
    name: string;
    ac: number;
    mac: number;
}

export interface Action {
    _id: string,
    name: string,
    intent: Intent,
    range: number,
    isWeapon: boolean,
    mpCost: number,
    effects: Effect[],
    dmgType: DamageType,
    target: TargetingType,
    burstRadius?: number,
    hands?: number
}

export interface Effect {
    type: EffectType;
    duration: number;
    targetStat: EffectTargetStat;
    dmgType: DamageType;
    targetsSelf: boolean;
    roll?: Roll;
    flatAmount?: number;
}

export interface ActiveEffect extends Effect {
    durationElapsed: number,
    effectiveAmount: number,
    castById: string,
    actionName: string
}

export interface Roll {
    name?: string;
    numDie: number; 
    dieSides: number;
    mod: number;
}

export interface RollResult {
    result: number;
    summary: string;
}

export interface ActionResult {
    newTargetChar: GameChar;
    action: Action;
    effectResults: EffectResult[];
    totalDmgDone: number;
    totalHealingDone: number;
    totalStatEffects: number;
    success: boolean;
    atkRollResult?: RollResult;
    dmgRollResult?: RollResult;
    flatDmgResult?: number;
    charDiedThisTurn?: boolean;
}

export interface EffectResult {
    effect: Effect,
    effectiveAmount: number,
    castById: string
}

export interface AiPlan {
    newDest: number | null;
    target: GameChar | null;
    chosenAction: Action | null;
}

export interface Party {
    _id: string;
    members: PartyMember[]
}

export interface PartyMember {
    _id: string;
    name: string;
    color: string;
    class: string;
    level: number;
}
