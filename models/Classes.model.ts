import {Schema, model} from "mongoose";
import { DbClass } from "../dbTypes";

const schema = new Schema<DbClass>({
    name: String,
    role: String,
    desc: String,
    attributes: {
        strength: Number,
        finesse: Number,
        toughness: Number,
        mind: Number,
        spirit: Number
    },
    attributeFocus: Array,
    weaponProfs: Array,
    armorProfs: Array,
    startingActions: Array,
    startingArmor: Array,
    startingWeapons: Array,
    passives: Array,
    availableInGame: Boolean,
    talents: Array
});

export default model<DbClass>('classes', schema);