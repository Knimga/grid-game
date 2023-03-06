import express from 'express';

import { Armor } from '../grid-game/src/types/types';

import ArmorsModel from '../models/Armor.model';

const router = express.Router();

router.route('/getAll').get((req,res) => {
    ArmorsModel.find().lean().then((armors: Armor[]) => 
        res.status(200).send(armors)
    ).catch((err) => {res.status(400).send(err)})
});

router.route('/save').post(async (req,res) => {  
    const armor: Armor = new ArmorsModel(req.body);

    ArmorsModel.findOneAndUpdate({_id: armor._id}, armor, {upsert: true, new: true}, 
        (err, savedAction: Armor) => {
            if(err) return res.status(500).send(err);
            return res.status(200).send(savedAction);
    }).lean();
});

export default router;