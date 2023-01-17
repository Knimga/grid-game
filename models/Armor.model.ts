import {Schema, model} from "mongoose";
import {Armor} from '../grid-game/src/types/types';

const schema = new Schema<Armor>({
    name: String,
    ac: Number,
    mac: Number
});

export default model<Armor>('armors', schema);