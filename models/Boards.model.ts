import {Schema, model} from "mongoose";
import {Board} from '../grid-game/src/types';

const schema = new Schema<Board>({
    name: String,
    gridWidth: Number,
    gridHeight: Number,
    portal: {required: false, type: Number},
    doors: Array,
    walls: Array,
    chars: Array
});

export default model<Board>('boards', schema);