import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import * as config from './config';

import CharacterRoute from './routes/Characters';
import BoardRoute from './routes/Boards';
import GameData from './routes/gameData';
import ActionsRoute from './routes/Actions';
import ClassesRoute from './routes/Classes';
import ArmorRoute from './routes/Armors';
import PartiesRoute from './routes/Parties';

const port: number = Number(process.env.PORT) || 4000;
const dbUrl: string = config.db;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/characters', CharacterRoute);
app.use('/boards', BoardRoute);
app.use('/gameData', GameData);
app.use('/actions', ActionsRoute);
app.use('/classes', ClassesRoute);
app.use('/armors', ArmorRoute);
app.use('/parties', PartiesRoute);

mongoose.connect(dbUrl).then(
    () => {console.log('Connected to Mongo!')},
    err => {console.log(`Cannot connect to the database: ${err}`)}
);

app.get( "/", ( req, res ) => {res.send( "Invalid endpoint" )});

app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${port}` );
} );