import express from 'express';

import {Character, GameChar, Class, Action, Armor, Attributes, Party, PartyMember} from '../grid-game/src/types';
import { DbCharacter, DbClass, DbParty } from '../dbTypes';

import { createStats, createAttributes, getACBonus, getMACBonus } from '../grid-game/src/services/charCalc';

import CharactersModel from '../models/Characters.model';
import ClassModel from '../models/Classes.model';
import ArmorModel from '../models/Armor.model';
import ActionsModel from '../models/Actions.model';

const router = express.Router();

router.route('/getAll').get(async (req,res) => {
    const classes: Class[] = await createClasses();
    res.status(200).send(classes);
});

router.route('/bulk').get(async (req,res) => {
    res.status(200).send({
        characters: await createCharacters(),
        classes: await createClasses(),
        actions: await ActionsModel.find().lean(),
        armors: await ArmorModel.find().lean()
    })
});

router.route('/test').get(async (req,res) => {
    ArmorModel.find().lean()
    .then(data => res.status(200).send(data))
    .catch((err) => {res.status(400).send(err)});
});


export async function createOneClass(dbClass: DbClass): Promise<Class> {
    const actions: Action[] = await ActionsModel.find({_id: {$in: dbClass.actions}}).lean();
    const armor: Armor[] = await ArmorModel.find({_id: {$in: dbClass.armor}}).lean();

    return {...dbClass, actions: actions, armor: armor}
}

export async function createClasses(): Promise<Class[]> {
    const dbClasses: DbClass[] = await ClassModel.find().lean();
    const classes: Class[] = [];

    for (let i = 0; i < dbClasses.length; i++) {
        const completedClass: Class = await createOneClass(dbClasses[i]);
        classes.push(completedClass);
    }
    return classes;
}

export function packageClass(charClass: Class): DbClass {
    const _id: Object = charClass._id ? {_id: charClass._id} : {};
    return {
        ..._id,
        name: charClass.name,
        role: charClass.role,
        attributes: charClass.attributes,
        attributeFocus: charClass.attributeFocus,
        armor: charClass.armor.map(armor => armor._id),
        actions: charClass.actions.map(action => action._id)
    }
}

export function packageCharacter(char: Character): DbCharacter {
    const _id: Object = char._id ? {_id: char._id} : {};
    return {
        ..._id,
        name: char.name,
        color: char.color,
        class: char.class._id,
        level: char.level,
        type: char.type,
        pointBuy: char.pointBuy
    }
}

export async function createCharacters(): Promise<Character[]> {
    const dbChars: DbCharacter[] = await CharactersModel.find().lean();
    const characters: Character[] = [];
    for (let i = 0; i < dbChars.length; i++) {
        const char: Character = await createOneCharacter(dbChars[i]);
        characters.push(char);
    }
    return characters;
}

export async function createOneCharacter(dbChar: DbCharacter): Promise<Character> {
    const dbClass: DbClass = await ClassModel.findById(dbChar.class).lean();
    const completedClass: Class = await createOneClass(dbClass);
    const armorACBonus: number = getACBonus(completedClass.armor);
    const armorMACBonus: number = getMACBonus(completedClass.armor);
    const attributes: Attributes = createAttributes(dbChar.pointBuy, completedClass, dbChar.level);

    return {
        ...dbChar,
        _id: dbChar._id,
        class: completedClass,
        attributes: attributes,
        stats: createStats(attributes, armorACBonus, armorMACBonus, dbChar.level),
        actions: completedClass.actions,
        armor: completedClass.armor
    }
}

export async function dbCharsToGameChars(dbChars: DbCharacter[]): Promise<GameChar[]> {
    const gameChars: GameChar[] = [];

    for (let i = 0; i < dbChars.length; i++) {
        const char: Character = await createOneCharacter(dbChars[i]);
        gameChars.push({
            ...char,
            game: {
                gameId: Math.random().toString().substring(2),
                positionIndex: -1,
                iniRoll: 0,
                isTurn: false,
                attributes: char.attributes,
                stats: char.stats,
                round: {
                    movementTaken: 0,
                    actionTaken: false
                },
                isVisible: false,
                hasBeenSeen: false,
                activeEffects: []
            }
        });
    }

    return gameChars;
}

export async function dbPartiesToParties(dbParties: DbParty[]): Promise<Party[]> {
    const parties: Party[] = [];
    for (let i = 0; i < dbParties.length; i++) {
        const party = await dbPartyToParty(dbParties[i]);
        parties.push(party);
    }
    return parties;
}

export async function dbPartyToParty(dbParty: DbParty): Promise<Party> {
    const chars: DbCharacter[] = await CharactersModel.find({_id: {$in: dbParty.members}}).lean();
    const members: PartyMember[] = [];

    for (let i = 0; i < chars.length; i++) {
        const className = (await ClassModel.findOne({_id: chars[i].class})).name;
        members.push({
            _id: chars[i]._id,
            name: chars[i].name,
            color: chars[i].color,
            level: chars[i].level,
            class: className
        });
    }

    return {_id: dbParty._id, members: members}
}

export default router;