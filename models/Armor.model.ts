import {Schema, model} from "mongoose";
import { Armor } from '../grid-game/src/types/types';

const schema = new Schema<Armor>({
    name: String,
    type: String,
    ac: Number,
    mac: Number,
    actions: Array,
    attrReqs: Array,
    passives: Array,
    isStartingArmor: Boolean
});

export default model<Armor>('armors', schema);