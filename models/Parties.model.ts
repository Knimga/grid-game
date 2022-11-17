import {Schema, model} from "mongoose";
import { DbParty } from '../dbTypes';

const schema = new Schema<DbParty>({
    members: Array
});

export default model<DbParty>('parties', schema);