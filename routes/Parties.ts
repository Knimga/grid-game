import express from 'express';

import { dbPartiesToParties, dbCharsToGameChars, createCharacters, dbPartyToParty } from './gameData';

import PartiesModel from '../models/Parties.model';
import ClassesModel from '../models/Classes.model';

import { Party, PartyMember, CharType } from '../grid-game/src/types';
import { DbParty } from '../dbTypes';
import CharactersModel from '../models/Characters.model';

const router = express.Router();

router.route('/getAll').get((req,res) => {
    PartiesModel.find().lean().then(async (dbParties) => {
        const parties: Party[] = await dbPartiesToParties(dbParties);
        res.status(200).send(parties);
    }).catch((err) => res.status(400).send(err));
});

router.route('/partiesTabData').get(async (req,res) => {
    const allPlayerChars = (await createCharacters()).filter(char => char.type === CharType.player);
    const dbParties = await PartiesModel.find().lean();
    const parties: Party[] = [];
    const allPartyMembers: PartyMember[] = [];

    for (let i = 0; i < allPlayerChars.length; i++) {
        const className = (await ClassesModel.findOne({_id: allPlayerChars[i].class}).lean()).name;
        allPartyMembers.push({
            _id: allPlayerChars[i]._id.toString(),
            name: allPlayerChars[i].name,
            color: allPlayerChars[i].color,
            level: allPlayerChars[i].level,
            class: className
        });
    }

    for (let p = 0; p < dbParties.length; p++) {
        const partyMembers = allPartyMembers.filter(member => dbParties[p].members.includes(member._id));
        parties.push({_id: dbParties[p]._id, members: partyMembers});
    }

    res.status(200).send({parties: parties, members: allPartyMembers});
});

router.route('/partyCharsById/:partyId').get(async (req,res) => {
    const partyId: string = req.params.partyId;
    const memberIds = (await PartiesModel.findById(partyId).lean()).members;
    const dbChars = await CharactersModel.find({_id: {$in: memberIds}}).lean();
    const chars = await dbCharsToGameChars(dbChars);
    for (let i = 0; i < chars.length; i++) {
        chars[i].game.isVisible = true;
        chars[i].game.hasBeenSeen = true;
    }
    res.status(200).send(chars);
});

router.route('/save').post(async (req,res) => {
    const party = req.body;
    const _id: Object = party._id ? {_id: party._id} : {};
    let dbParty: DbParty = {..._id, members: party.members.map((m: PartyMember) => m._id)}
    dbParty = new PartiesModel(dbParty);

    PartiesModel.findOneAndUpdate({_id: dbParty._id}, dbParty, {upsert: true, new: true}, 
        async (err, savedDbParty: DbParty) => {
            if(err) return res.status(500).send(err);
            const newParty: Party = await dbPartyToParty(savedDbParty);
            return res.status(200).send(newParty);
    }).lean();
});

router.route('/delete/:_id').get((req,res) => {
    const _id: string = req.params._id;
    PartiesModel.findByIdAndDelete(_id, () => {
        res.status(200).send()
    }).catch((err) => res.status(400).send(err));
});

export default router;