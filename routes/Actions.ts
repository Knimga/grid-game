import express from 'express';

import { Action } from '../grid-game/src/types/types';

import ActionsModel from '../models/Actions.model';

const router = express.Router();

router.route('/getAll').get((req,res) => {
    ActionsModel.find().lean().then((actions: Action[]) => 
        res.status(200).send(actions)
    ).catch((err) => {res.status(400).send(err)})
});

router.route('/save').post(async (req,res) => {  
    let action: Action = req.body;
    action = new ActionsModel(action);

    ActionsModel.findOneAndUpdate({_id: action._id}, action, {upsert: true, new: true}, 
        (err, savedAction: Action) => {
            if(err) return res.status(500).send(err);
            return res.status(200).send(savedAction);
    }).lean();
});

router.route('/create').post(async (req,res) => {
    const action = new ActionsModel(req.body);
    await action.save();
    res.status(200).send();
});

export default router;