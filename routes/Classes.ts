import express from 'express';

import { Class } from '../grid-game/src/types/types';
import { DbClass } from '../dbTypes';

import ClassesModel from '../models/Classes.model';

import { createOneClass, createClasses, packageClass } from './gameData';

const router = express.Router();

router.route('/getAll').get(async (req,res) => {
    const classes: Class[] = await createClasses();
    res.status(200).send(classes);
});

router.route('/save').post(async (req,res) => {  
    let charClass: Class = req.body;
    const dbClass = new ClassesModel(packageClass(charClass));

    ClassesModel.findOneAndUpdate({_id: dbClass._id}, dbClass, {upsert: true, new: true}, 
        async (err, savedClass: DbClass) => {
            if(err) return res.status(500).send(err);
            const savedCharClass: Class = await createOneClass(savedClass);
            return res.status(200).send(savedCharClass);
    }).lean();
});

router.route('/create').post(async (req,res) => {
    const charClass: Class = req.body;
    const dbClass = new ClassesModel(packageClass(charClass));
    await dbClass.save();
    res.status(200).send();
});

export default router;