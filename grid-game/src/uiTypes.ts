import {GameChar, BoardChar} from './types';

export type Coord = [number, number]

export interface Square {
    type: TerrainType;
    style: Style;
    char?: GameChar | BoardChar;
}

export interface GameSquare {
    type: TerrainType;
    style?: Style;
    char?: GameChar;
}

export interface EditorSquare {
    type: TerrainType;
    style?: Style;
    char?: BoardChar;
}

export interface Style {
    width: number;
    height: number;
    backgroundColor?: string;
    filter?: string;
    outline?: string;
}

export interface Terrain {
    _id: string;
    name: string;
    color: string;
}

export enum TerrainType {
    wall = 'wall',
    floor = 'floor'
}

export enum TerrainTypeColors {
    wall = "#303030",
    floor = ""
}

export interface BoardCharSelection {
    _id: string;
    name: string;
    color: string;
}



export enum ToolType {
    wall = "wall",
    character = "char",
    portal = "portal",
    door = "door",
    none = ""
}

export interface TurnLog {header: string, actions: string[]}

export enum LogType {
    beginGame = 'beginGame',
    newRound = 'newRound',
    movement = 'movement',
    attack = 'attack',
    powerCast = 'powerCast',
    charDies = 'charDies'
}

export interface BoardSelection {
    id: string; 
    name: string; 
    entryPointIds: string[];
}

export interface DungeonSelection {
    _id: string;
    name: string;
}

export interface BoardCharSelection {
    _id: string; 
    name: string; 
    color: string
}

export enum RangeType {
    atk = 'atk',
    def = 'def',
    mvt = 'mvt',
    los = 'los'
}

export interface MetersEntry {
    gameId: string,
    charName: string,
    charType: string,
    color: string,
    meters: MeterTypes
}

export interface MeterTypes {
    dmgDone: number,
    dmgTaken: number,
    healingDone: number,
    threat: number
}

export interface InputOption {enumValue: string, displayValue: string}

export interface DoorToBoardMap {
    doorId: string;
    boardId: string;
    doorIndex: number;
    boardIndex: number;
}
