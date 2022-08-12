import {Schema, model} from "mongoose";
import { DbClass } from "../dbTypes";

const schema = new Schema<DbClass>({
    name: String,
    role: String,
    attributes: {
        strength: Number,
        finesse: Number,
        toughness: Number,
        mind: Number,
        spirit: Number
    },
    attributeFocus: Array,
    actions: Array,
    armor: Array
});

export default model<DbClass>('classes', schema);