import {Schema, model} from "mongoose";
import {Weapon} from '../grid-game/src/types/types';

const schema = new Schema<Weapon>({
    name: String,
    type: String,
    action: Object,
    otherActions: Array,
    attrReqs: Array,
    passives: Array,
    hands: Number,
    isStartingWeapon: Boolean
});

export default model<Weapon>('weapons', schema);