import express from 'express';

import {
    Character, GameChar, BoardChar, Stats, Class, Action, Armor, Attributes, Party, PartyMember,
    Dungeon, GameDungeon, GameBoard, Affinities, Weapon, Passive, PassiveEffect, Talent, InventoryItem 
} from '../grid-game/src/types/types';
import { DbCharacter, DbClass, DbInventoryItem, DbParty, DbTalent } from '../dbTypes';

import { 
    createStats, createAttributes, createAffinities, getACBonus, getMACBonus, getCharPassiveEffects, getCharActions 
} from '../grid-game/src/services/charCalc';
import { randId } from '../grid-game/src/services/detailStrings';

import CharactersModel from '../models/Characters.model';
import ClassModel from '../models/Classes.model';
import ArmorModel from '../models/Armor.model';
import ActionsModel from '../models/Actions.model';
import WeaponsModel from '../models/Weapons.model';
import PassivesModel from '../models/Passives.model';

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


export async function dbClassToClass(dbClass: DbClass): Promise<Class> {
    const actions: Action[] = await ActionsModel.find({_id: {$in: dbClass.startingActions}}).lean();
    const armor: Armor[] = await ArmorModel.find({_id: {$in: dbClass.startingArmor}}).lean();
    const weapons: Weapon[] = await WeaponsModel.find({_id: {$in: dbClass.startingWeapons}}).lean();
    const passives: Passive[] = await PassivesModel.find({_id: {$in: dbClass.passives}}).lean();
    const talents: Talent[][] = await dbTalentsToTalents(dbClass.talents);

    return {
        ...dbClass, 
        startingWeapons: weapons,
        startingArmor: armor,
        startingActions: actions,
        passives: passives,
        talents: talents
    }
}

export async function createClasses(): Promise<Class[]> {
    const dbClasses: DbClass[] = await ClassModel.find().lean();
    const classes: Class[] = [];

    for (let i = 0; i < dbClasses.length; i++) {
        const completedClass: Class = await dbClassToClass(dbClasses[i]);
        classes.push(completedClass);
    }
    return classes;
}

export function classToDbClass(charClass: Class): DbClass {
    const _id: Object = charClass._id ? {_id: charClass._id} : {};

    return {
        ..._id,
        name: charClass.name,
        role: charClass.role,
        desc: charClass.desc,
        attributes: charClass.attributes,
        attributeFocus: charClass.attributeFocus,
        armorProfs: charClass.armorProfs,
        weaponProfs: charClass.weaponProfs,
        startingWeapons: charClass.startingWeapons.map(weap => weap._id),
        startingArmor: charClass.startingArmor.map(armor => armor._id),
        startingActions: charClass.startingActions.map(action => action._id),
        passives: charClass.passives.map(p => p._id),
        availableInGame: charClass.availableInGame,
        talents: talentsToDbTalents(charClass.talents)
    }
}

export function characterToDbCharacter(char: Character): DbCharacter {
    const _id: Object = char._id ? {_id: char._id} : {};
    return {
        ..._id,
        name: char.name,
        color: char.color,
        class: char.class._id,
        level: char.level,
        xp: char.xp,
        type: char.type,
        pointBuy: char.pointBuy,
        selectedTalents: char.selectedTalents,
        inventory: inventoryToDbInventory(char.inventory)
    }
}

export async function createCharacters(_ids?: string[]): Promise<Character[]> {
    const query = _ids ? {_id: {$in: _ids}} : {};
    const dbChars: DbCharacter[] = await CharactersModel.find(query).lean();
    const characters: Character[] = [];
    for (let i = 0; i < dbChars.length; i++) {
        const char: Character = await dbCharToCharacter(dbChars[i]);
        characters.push(char);
    }
    return characters;
}

export async function dbCharToCharacter(dbChar: DbCharacter): Promise<Character> {
    const dbClass: DbClass = await ClassModel.findById(dbChar.class).lean();
    const charClass: Class = await dbClassToClass(dbClass);
    const inventory: InventoryItem[] = await dbInventoryToInventory(dbChar.inventory);

    const armorACBonus: number = getACBonus(inventory);
    const armorMACBonus: number = getMACBonus(inventory);
    const allPassives: PassiveEffect[] = getCharPassiveEffects(charClass, inventory, 
        dbChar.selectedTalents);
    
    const attributes: Attributes = createAttributes(dbChar.pointBuy, charClass, dbChar.level, 
        allPassives);
    const affinities: Affinities = createAffinities(attributes, allPassives);
    const stats: Stats = createStats(attributes, affinities, armorACBonus, armorMACBonus, 
        dbChar.level, allPassives);

    const char: Character = {
        ...dbChar,
        _id: dbChar._id.toString(),
        class: charClass,
        attributes: attributes,
        stats: stats,
        actions: [],
        selectedTalents: dbChar.selectedTalents,
        inventory: inventory
    }

    return {...char, actions: getCharActions(char)}
}

export async function dbCharsToGameChars(dbChars: DbCharacter[]): Promise<GameChar[]> {
    const gameChars: GameChar[] = [];

    for (let i = 0; i < dbChars.length; i++) {
        const char: Character = await dbCharToCharacter(dbChars[i]);
        gameChars.push(charToGameChar(char));
    }

    return gameChars;
}

export function charToGameChar(char: Character, boardChar?: BoardChar): GameChar {
    return {
        ...char,
        game: {
            gameId: randId(),
            positionIndex: boardChar?.index ?? -1,
            iniRoll: 0,
            isTurn: false,
            attributes: char.attributes,
            stats: char.stats,
            round: {
                movementTaken: 0,
                actionTaken: false
            },
            meters: {
                threat: 0,
                dmgDone: 0,
                dmgTaken: 0,
                healingDone: 0,
                statEffectsDone: 0
            },
            isVisible: false,
            hasBeenSeen: false,
            activeEffects: [],
            isBoss: boardChar?.isBoss ?? false
        }
    }
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

export async function dungeonToGameDungeon(dungeon: Dungeon): Promise<GameDungeon> {
    const allCharIds: string[] = dungeon.boards.map(board => board.chars.map(c => c._id)).flat(1);
    const uniqueIds: string[] = [...new Set(allCharIds)];
    const allChars: Character[] = await createCharacters(uniqueIds);

    const gameBoards: GameBoard[] = dungeon.boards.map(board => {
        const charIds: string[] = board.chars.map(c => c._id);
        const charsOnThisBoard: Character[] = allChars.filter(c => charIds.includes(c._id));
        const gameChars: GameChar[] = [];
        
        for (let i = 0; i < board.chars.length; i++) {
            const boardChar: BoardChar = board.chars[i];
            const char: Character | undefined = charsOnThisBoard.find(c => c._id === boardChar._id);
            if(char) gameChars.push(charToGameChar(char, boardChar));
        }

        return {...board, chars: gameChars, exploredAreas: []}
    });

    return {...dungeon, boards: gameBoards}
}

export async function dbTalentsToTalents(dbTalents: DbTalent[][]): Promise<Talent[][]> {
    const passiveTalentIds: string [] = [];
    const actionTalentIds: string[] = [];

    for (let i = 0; i < dbTalents.length; i++) {
        for (let t = 0; t < dbTalents[i].length; t++) {
            const thisTalent = dbTalents[i][t];
            if(thisTalent.passiveId) passiveTalentIds.push(thisTalent.passiveId);
            if(thisTalent.actionId) actionTalentIds.push(thisTalent.actionId);
        }
    }

    const passives: Passive[] = await PassivesModel.find({_id: {$in: passiveTalentIds}}).lean();
    const actions: Action[] = await ActionsModel.find({_id: {$in: actionTalentIds}}).lean();
    const talents: Talent[][] = dbTalents.map(tier => []);

    for (let i = 0; i < dbTalents.length; i++) {
        for (let t = 0; t < dbTalents[i].length; t++) {
            const thisTalent = dbTalents[i][t];
            if(thisTalent.passiveId) {
                const passive: Passive | undefined = passives.find(//ugh why to I need to use toString() here...
                    p => p._id.toString() === thisTalent.passiveId.toString());
                if(passive) talents[i].push({passive: passive, action: null});
            }
            if(thisTalent.actionId) {
                const action: Action | undefined = actions.find(
                    a => a._id.toString() === thisTalent.actionId.toString());
                if(action) talents[i].push({action: action, passive: null});
            }
        }
    }

    return talents;
}

function talentsToDbTalents(talents: Talent[][]): DbTalent[][] {
    return talents.map(tier => {return tier.map(talent => {
        return { 
            passiveId: talent.passive?._id.toString() || null,
            actionId: talent.action?._id.toString() || null
        }})
    })
}

function inventoryToDbInventory(inventory: InventoryItem[]): DbInventoryItem[] {
    return inventory.map(item => {
        return {
            isStackable: item.isStackable,
            qty: item.qty,
            isEquipped: item.isEquipped,
            weaponId: item.weapon ? item.weapon._id : null,
            armorId: item.armor ? item.armor._id : null,
            itemId: item.item ? item.item._id : null
        }
    })
}

async function dbInventoryToInventory(dbInventory: DbInventoryItem[]): Promise<InventoryItem[]> {
    const weaponIds: string[] = [];
    const armorIds: string[] = [];

    for (let i = 0; i < dbInventory.length; i++) {
        if(dbInventory[i].weaponId) weaponIds.push(dbInventory[i].weaponId);
        if(dbInventory[i].armorId) armorIds.push(dbInventory[i].armorId);
    }

    const weapons: Weapon[] = await WeaponsModel.find({_id: {$in: weaponIds}}).lean();
    const armors: Armor[] = await ArmorModel.find({_id: {$in: armorIds}}).lean();
    const inventory: InventoryItem[] = [];

    for (let i = 0; i < dbInventory.length; i++) {
        const thisItem: DbInventoryItem = dbInventory[i];
        const sharedInvProps = {
            isStackable: thisItem.isStackable,
            qty: thisItem.qty,
            isEquipped: thisItem.isEquipped
        };

        if(thisItem.weaponId) {
            const weapon: Weapon | undefined = weapons.find(w => w._id.toString() === thisItem.weaponId);
            if(!weapon) {console.log('no weapon!'); break;}
            inventory.push({...sharedInvProps, weapon: weapon, armor: null, item: null});
        }
        if(thisItem.armorId) {
            const armor: Armor | undefined = armors.find(a => a._id.toString() === thisItem.armorId);
            if(!armor) {console.log('no armor!'); break;}
            inventory.push({...sharedInvProps, weapon: null, armor: armor, item: null});
        }
    }
    
    return inventory;
}

/*async function getCharWeapons(weaponIds: string[]): Promise<Weapon[]> {
    const weapons: Weapon[] = await WeaponsModel.find({_id: {$in: weaponIds}}).lean();
    return weapons;
}

async function getCharArmor(armorIds: string[]): Promise<Armor[]> {
    const armor: Armor[] = await ArmorModel.find({_id: {$in: armorIds}}).lean();
    return armor;
}

function getTalentPassiveEffects(talents: Talent[][]): PassiveEffect[] {
    return talents.flat(1).filter(talent => talent.passive !== null)
        .map(talent => talent.passive.effects).flat(1)
}

function getCharActions(char: Character, talents: Talent[][]): Action[] {
    const weaponActions: Action[] = char.equippedWeapons.map(w => w.action);
    const weaponOtherActions: Action[] = char.equippedWeapons.map(w => w.otherActions).flat(1);
    const armorActions: Action[] = char.equippedArmor.map(a => a.actions).flat(1);
    const actionTalents: Action[] = talents.flat(1).filter(talent => talent.action !== null)
        .map(talent => talent.action);

    return [
        ...char.class.startingActions,
        ...weaponActions,
        ...weaponOtherActions,
        ...armorActions,
        ...actionTalents
    ]
}*/

export default router;