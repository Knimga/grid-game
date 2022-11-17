export interface Character {
    _id: string;
    color: string;
    name: string;
    class: Class;
    level: number;
    type: CharType;
    attributes: Attributes;
    pointBuy: Attributes;
    stats: Stats;
    actions: Action[];
    armor: Armor[];
}

export interface GameChar extends Character {game: GameCharInfo}

interface GameCharInfo {
    gameId: string;
    positionIndex: number;
    iniRoll: number;
    isTurn: boolean;
    attributes: Attributes;
    stats: Stats;
    round: {
        movementTaken: number;
        actionTaken: boolean;
    },
    isVisible: boolean;
    hasBeenSeen: boolean;
    destinationIndex?: number; //for enemies only
    activeEffects: ActiveEffect[]
}

export interface Attributes {
    strength: number;
    finesse: number;
    toughness: number;
    mind: number;
    spirit: number;
}

export interface Affinities {
    fire: number,
    wind: number,
    earth: number,
    shadow: number,
    water: number,
    holy: number,
    poison: number
}

export interface DamageTypes {
    fire: Bonuses,
    wind: Bonuses,
    earth: Bonuses,
    shadow: Bonuses,
    water: Bonuses,
    holy: Bonuses,
    poison: Bonuses,
    melee: Bonuses,
    ranged: Bonuses,
    magic: Bonuses
}

export interface Stats { //all calculated from attributes
    hp: number,
    hpRegen: number,
    mp: number,
    mpRegen: number,
    ac: number,
    mac: number,
    ini: number,
    mvt: number,
    bonusHealingDone: number,
    bonusHealingRcvd: number,
    affinities: Affinities,
    dmgTypes: DamageTypes
}

export interface Class {
    _id?: string;
    name: string;
    role: ClassRole;
    attributes: Attributes,
    attributeFocus: AttributeFocus,
    armor: Armor[],
    actions: Action[]
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
    type: EffectType,
    duration: number,
    targetStat: EffectTargetStat,
    dmgType: DamageType,
    roll?: Roll,
    flatAmount?: number
}

export interface ActiveEffect extends Effect {
    durationElapsed: number,
    effectiveAmount: number,
    castById: string,
    actionName: string
}

export interface PassiveEffect {
    name: string;
    effects: {targetStat: EffectTargetStat; amount: number;}[]
}

export interface Armor {
    _id: string,
    name: string;
    ac: number;
    mac: number;
}

export interface Bonuses {atk: number; dmg: number; dr: number;}

export type AttributeFocus = [keyof Attributes, keyof Attributes];


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
    newChar: GameChar;
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

export interface Board {
    _id?: string;
    name: string;
    gridWidth: number;
    gridHeight: number;
    portal?: number;
    //doors: Door[];
    walls: number[];
    chars: BoardChar[];
}

/*interface Door {
    id: string;
    name: string;
    position: number;
    leadsTo: {mapId: string; doorName: string;}
}*/

export interface BoardChar {
    _id: string; 
    index: number;
    name: string;
    color: string;
}

export interface GameBoard {
    _id?: string;
    name: string;
    gridWidth: number;
    gridHeight: number;
    portal?: number;
    //doors: Door[];
    walls: number[];
    chars: GameChar[];
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

export enum CharType {
    enemy = 'enemy',
    player = 'player',
    beast = 'beast'
}

export enum AttributeEnum {
    strength = 'strength',
    finesse = 'finesse',
    toughness = 'toughness',
    mind = 'mind',
    spirit = 'spirit'
}

export enum ClassRole {
    melee = 'melee',
    ranged = 'ranged',
    magic = 'magic',
    support = 'support'
}

export enum ElementType {
    fire = 'fire',
    wind = 'wind',
    earth = 'earth',
    shadow = 'shadow',
    water = 'water'
}

export enum DamageType {
    fire = 'fire',
    wind = 'wind',
    earth = 'earth',
    shadow = 'shadow',
    water = 'water',
    holy = 'holy',
    poison = 'poison',
    melee = 'melee',
    ranged = 'ranged',
    magic = 'magic'
}

export enum DamageTypeColor {
    fire = 'darkred',
    wind = 'lightblue',
    earth = 'darkgoldenrod',
    shadow = 'purple',
    water = 'dodgerblue',
    holy = 'gold',
    poison = 'olivedrab',
    melee = 'lightgray',
    ranged = 'lightgray',
    magic = 'lavender'
}

export enum DamageTypeDarkColor {
    fire = '#300300',
    wind = '#165e80',
    earth = '#261e03',
    shadow = '#21072b',
    water = '#05123d',
    holy = '#474701',
    poison = '#021f00',
    melee = '#202020',
    ranged = '#202020',
    magic = 'darkslategray'
}

export enum Intent {
    offense = 'offense',
    defense = 'defense'
}

export enum TargetingType {
    single = 'single',
    burst = 'burst',
    line = 'line',
    self = 'self'
}

export enum EffectType {
    healing = 'healing',
    buff = 'buff',
    debuff = 'debuff',
    damage = 'damage',
    hot = 'hot',
    dot = 'dot'
}

export enum EffectTargetStat {
    hp = 'hp',
    hpRegen = 'hpRegen',
    mp = 'mp',
    mpRegen = 'mpRegen',
    ac = 'ac',
    mac = 'mac',
    mvt = 'mvt',
    bonusHealingDone = 'bonusHealingDone',
    bonusHealingRcvd = 'bonusHealingRcvd',
    allAtkRolls = 'allAtkRolls',
    allDmgRolls = 'allDmgRolls',
    allDr = 'allDr',
    meleeAtk = 'meleeAtk',
    meleeDmg = 'meleeDmg',
    meleeDr = 'meleeDr',
    rangedAtk = 'rangedAtk',
    rangedDmg = 'rangedDmg',
    rangedDr = 'rangedDr',
    magicAtk = 'magicAtk',
    magicDmg = 'magicDmg',
    magicDr = 'magicDr',
    fireAtk = 'fireAtk',
    fireDmg = 'fireDmg',
    fireDr = 'fireDr',
    windAtk = 'windAtk',
    windDmg = 'windDmg',
    windDr = 'windDr',
    earthAtk = 'earthAtk',
    earthDmg = 'earthDmg',
    earthDr = 'earthDr',
    shadowAtk = 'shadowAtk',
    shadowDmg = 'shadowDmg',
    shadowDr = 'shadowDr',
    waterAtk = 'waterAtk',
    waterDmg = 'waterDmg',
    waterDr = 'waterDr',
    holyAtk = 'holyAtk',
    holyDmg = 'holyDmg',
    holyDr = 'holyDr',
    poisonAtk = 'poisonAtk',
    poisonDmg = 'poisonDmg',
    poisonDr = 'poisonDr'
}
