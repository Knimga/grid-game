import {GameChar, BoardChar} from './types';

export type Coord = [number, number] // only use coords when calculating lines / distance

export interface GameSquare {
    type: TerrainType;
    char?: GameChar;
}

export interface EditorSquare {
    type: TerrainType;
    char?: BoardChar;
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

export interface Style {
    width: number;
    height: number;
    backgroundColor?: string;
    color?: string;
}

export enum ToolType {
    terrain = "terrain",
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

export interface BoardSelection {_id: string; name: string}

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
