import express from 'express';

import { Action } from '../grid-game/src/types/types';

import ActionsModel from '../models/Actions.model';

//import { getTargetStatType } from '../grid-game/src/services/effects';

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

//used for bulk addition of targetStatType to all action effects
/*router.route('/cleanupEffects').get(async (req,res) => {
    const actions = await ActionsModel.find().lean();

    for (let a = 0; a < actions.length; a++) {
        for (let e = 0; e < actions[a].effects.length; e++) {
            actions[a].effects[e].targetStatType = getTargetStatType(actions[a].effects[e].targetStat)
        }

        ActionsModel.findOneAndUpdate({_id: actions[a]._id}, actions[a], {upsert: true, new: true}, 
            (err, savedAction: Action) => {if(err) return res.status(500).send(err);}).lean();
    }

    res.status(200).send();
});*/

export default router;