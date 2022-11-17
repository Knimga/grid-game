import {Schema, model} from "mongoose";
import {Action} from '../grid-game/src/types';

const schema = new Schema<Action>({
    name: String,
    range: Number,
    intent: String,
    dmgType: String,
    mpCost: Number,
    effects: Array,
    isWeapon: Boolean,
    target: String,
    burstRadius: {required: false, type: Number}
});

export default model<Action>('actions', schema);