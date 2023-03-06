import express from 'express';

import { Passive } from '../grid-game/src/types/types';

import PassivesModel from '../models/Passives.model';

const router = express.Router();

router.route('/getAll').get((req,res) => {
    PassivesModel.find().lean().then((passives: Passive[]) => 
        res.status(200).send(passives)
    ).catch((err) => {res.status(400).send(err)})
});

router.route('/save').post(async (req,res) => {  
    const passive: Passive = new PassivesModel(req.body);

    PassivesModel.findOneAndUpdate({_id: passive._id}, passive, {upsert: true, new: true}, 
        (err, savedPassive: Passive) => {
            if(err) return res.status(500).send(err);
            return res.status(200).send(savedPassive);
    }).lean();
});

export default router;