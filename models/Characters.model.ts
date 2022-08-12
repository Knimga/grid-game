import {Schema, model} from "mongoose";
import { DbCharacter } from "../dbTypes";

const schema = new Schema<DbCharacter>({
    name: {type: String, required: true},
    level: {type: Number, required: true},
    class: String,
    color: {type: String, required: true},
    type: {type: String, required: true},
    pointBuy: {
        strength: Number,
        finesse: Number,
        toughness: Number,
        mind: Number,
        spirit: Number
    }
});

export default model<DbCharacter>('characters', schema);