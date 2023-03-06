import express from 'express';

import { Weapon } from '../grid-game/src/types/types';

import WeaponsModel from '../models/Weapons.model';

const router = express.Router();

router.route('/getAll').get((req,res) => {
    WeaponsModel.find().lean().then((weapons: Weapon[]) => 
        res.status(200).send(weapons)
    ).catch((err) => {res.status(400).send(err)})
});

router.route('/save').post(async (req,res) => {  
    const weapon: Weapon = new WeaponsModel(req.body);

    WeaponsModel.findOneAndUpdate({_id: weapon._id}, weapon, {upsert: true, new: true}, 
        (err, savedAction: Weapon) => {
            if(err) return res.status(500).send(err);
            return res.status(200).send(savedAction);
    }).lean();
});

export default router;