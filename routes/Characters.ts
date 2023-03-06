import express from 'express';

import { createCharacters, dbCharToCharacter, characterToDbCharacter, dbClassToClass } from './gameData';

import CharacterModel from '../models/Characters.model';
import ClassesModel from '../models/Classes.model';
import { Character, BoardChar, Class } from '../grid-game/src/types/types';
import { DbCharacter, DbClass } from '../dbTypes';
import { newInventory } from '../grid-game/src/services/charCalc';

const router = express.Router();

router.route('/getAll').get(async (req,res) => {
    const chars: Character[] = await createCharacters();
    res.status(200).send(chars);
});

router.route('/getAllCharSummaries').get(async (req,res) => {
    const chars: DbCharacter[] = await CharacterModel.find().lean();
    const summaries = [];
    for (let i = 0; i < chars.length; i++) {
        const className: string = (await ClassesModel.findById(chars[i].class).lean()).name;
        summaries.push({
            name: chars[i].name, 
            level: chars[i].level, 
            className: className, 
            type: chars[i].type
        });
    }
    res.status(200).send(summaries);
});

router.route('/getBoardChars').get((req,res) => {
    CharacterModel.find({type: {$ne: 'player'}}).lean().then(chars => {
        const boardChars: BoardChar[] = chars.map(char => {
            return {_id: char._id, name: char.name, color: char.color, index: -1}
        });
        res.status(200).send(boardChars);
    })
});

router.route('/save').post(async (req,res) => {  
    let char: DbCharacter = characterToDbCharacter(req.body);
    char = new CharacterModel(char);

    CharacterModel.findOneAndUpdate({_id: char._id}, char, {upsert: true, new: true}, 
        async (err, savedChar: DbCharacter) => {
            if(err) return res.status(500).send(err);
            const newChar: Character = await dbCharToCharacter(savedChar);
            return res.status(200).send(newChar);
    }).lean();
});

router.route('/delete/:_id').get((req,res) => {
    const _id: string = req.params._id;
    CharacterModel.findByIdAndDelete(_id, () => {
        res.status(200).send()
    }).catch((err) => res.status(400).send(err));
});

//for testing purposes
/*router.route('/getOne/:_id').get(async (req,res) => {
    const dbChar: DbCharacter = await CharacterModel.findById(req.params._id).lean();
    const char: Character = await dbCharToCharacter(dbChar);
    res.status(200).send(char);
})*/

export default router;