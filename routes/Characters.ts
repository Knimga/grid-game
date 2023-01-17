import express from 'express';

import { createCharacters, createOneCharacter, packageCharacter } from './gameData';

import CharacterModel from '../models/Characters.model';
import { Character, BoardChar } from '../grid-game/src/types/types';
import { DbCharacter } from '../dbTypes';

const router = express.Router();

router.route('/getAll').get(async (req,res) => {
    const chars: Character[] = await createCharacters();
    res.status(200).send(chars);
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
    let char: DbCharacter = packageCharacter(req.body);
    char = new CharacterModel(char);

    CharacterModel.findOneAndUpdate({_id: char._id}, char, {upsert: true, new: true}, 
        async (err, savedChar: DbCharacter) => {
            if(err) return res.status(500).send(err);
            const newChar: Character = await createOneCharacter(savedChar);
            return res.status(200).send(newChar);
    }).lean();
});

router.route('/create').post(async (req,res) => {
    const char = new CharacterModel(req.body);
    await char.save();
    res.status(200).send();
});

router.route('/delete/:_id').get((req,res) => {
    const _id: string = req.params._id;
    CharacterModel.findByIdAndDelete(_id, () => {
        res.status(200).send()
    }).catch((err) => res.status(400).send(err));
});

export default router;