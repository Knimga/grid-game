import {Schema, model} from "mongoose";
import {Passive} from '../grid-game/src/types/types';

const schema = new Schema<Passive>({
    name: String,
    dmgType: String,
    effects: Array
});

export default model<Passive>('passives', schema);