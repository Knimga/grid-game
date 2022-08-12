import express from 'express';

import { Armor } from '../grid-game/src/types';

import ArmorsModel from '../models/Armor.model';

const router = express.Router();

router.route('/getAll').get((req,res) => {
    ArmorsModel.find().lean().then((armors: Armor[]) => 
        res.status(200).send(armors)
    ).catch((err) => {res.status(400).send(err)})
});

router.route('/save').post(async (req,res) => {  
    let armor: Armor = req.body;
    armor = new ArmorsModel(armor);

    ArmorsModel.findOneAndUpdate({_id: armor._id}, armor, {upsert: true, new: true}, 
        (err, savedAction: Armor) => {
            if(err) return res.status(500).send(err);
            return res.status(200).send(savedAction);
    }).lean();
});

router.route('/create').post(async (req,res) => {
    const armor = new ArmorsModel(req.body);
    await armor.save();
    res.status(200).send();
});

export default router;