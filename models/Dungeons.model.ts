import {Schema, model} from "mongoose";
import {Dungeon} from '../grid-game/src/types/types';

const schema = new Schema<Dungeon>({
    name: String,
    floorColor: String,
    wallColor: String,
    boards: Array
});

export default model<Dungeon>('dungeons', schema);