import express from 'express';

import { Action, TargetingType } from '../grid-game/src/types/types';

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

/*router.route('/transform').get(async (req,res) => {
    const actions = await ActionsModel.find().lean();

    for (let i = 0; i < actions.length; i++) {
        const thisAction = actions[i];
        thisAction.target = targetingType(thisAction);
        if(thisAction.line) delete thisAction.line;

        const newModel = new ActionsModel(thisAction);

        await ActionsModel.findOneAndUpdate({_id: newModel._id}, newModel, {upsert: true, new: true}).clone();
    }
    res.status(200).send();
});

function targetingType(action: Action): TargetingType {
    if(action.burstRadius) return TargetingType.burst;
    if(action.line) return TargetingType.line;
    if(action.range === 0) return TargetingType.self;
    return TargetingType.single;
}*/

export default router;