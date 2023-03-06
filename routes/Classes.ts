import express from 'express';

import { Class, Talent } from '../grid-game/src/types/types';
import { DbClass } from '../dbTypes';

import ClassesModel from '../models/Classes.model';

import { dbClassToClass, createClasses, classToDbClass, dbTalentsToTalents } from './gameData';

const router = express.Router();

router.route('/getAll').get(async (req,res) => {
    const classes: Class[] = await createClasses();
    res.status(200).send(classes);
});

router.route('/getById/:_id').get(async (req, res) => {
    const _id = req.params._id;
    ClassesModel.findById(_id).lean().then(async (dbClass) => {
        const charClass = await dbClassToClass(dbClass);
        res.status(200).send(charClass);
    });
});

router.route('/save').post(async (req,res) => {  
    let charClass: Class = req.body;
    const dbClass = new ClassesModel(classToDbClass(charClass));

    ClassesModel.findOneAndUpdate({_id: dbClass._id}, dbClass, {upsert: true, new: true}, 
        async (err, savedClass: DbClass) => {
            if(err) return res.status(500).send(err);
            const savedCharClass: Class = await dbClassToClass(savedClass);
            return res.status(200).send(savedCharClass);
    }).lean();
});

router.route('/getTalentsByClassId/:classId').get(async (req,res) => {
    const dbClass: DbClass = await ClassesModel.findById(req.params.classId).lean();
    const talents: Talent[][] = await dbTalentsToTalents(dbClass.talents);
    res.status(200).send(talents);
});

export default router;