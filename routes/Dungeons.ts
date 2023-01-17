import express from 'express';

import DungeonModel from '../models/Dungeons.model';

import { Dungeon } from '../grid-game/src/types/types';
import { dungeonToGameDungeon } from './gameData';

const router = express.Router();

router.route('/getAll').get((req,res) => {
    DungeonModel.find().lean().then((dungeons: Dungeon[]) => {
        res.status(200).send(dungeons);
    }).catch((err) => {res.status(400).send(err)})
});

router.route('/save').post(async (req,res) => {
    const dungeon: Dungeon = new DungeonModel(req.body);
    
    DungeonModel.findOneAndUpdate({_id: dungeon._id}, dungeon, {upsert: true, new: true}, 
        async (err, savedDungeon: Dungeon) => {
            if(err) return res.status(500).send(err);
            return res.status(200).send(savedDungeon);
    }).lean();
});

router.route('/dungeonSelections').get((req,res) => {
    DungeonModel.find({}, {"name": 1}).lean().then(dungeons => {
        res.status(200).send(dungeons);
    }).catch((err) => {res.status(400).send(err)})
});

router.route('/getGameDungeonById/:_id').get(async (req, res) => {
    const dungeon = await DungeonModel.findById(req.params._id).lean();
    const gameDungeon = await dungeonToGameDungeon(dungeon);
    res.status(200).send(gameDungeon);
});

export default router;