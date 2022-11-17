import express from 'express';

import { GameBoard, Board, BoardChar, Character, GameChar } from '../grid-game/src/types';
import {BoardSelection} from '../grid-game/src/uiTypes';
import { DbCharacter } from '../dbTypes';

import { createOneCharacter } from './gameData';
import { setVisibility } from '../grid-game/src/services/los';

import BoardModel from '../models/Boards.model';
import Characters from '../models/Characters.model';

const router = express.Router();

router.route('/save').post(async (req,res) => {
    const board: Board = new BoardModel(req.body);
    
    BoardModel.findOneAndUpdate({_id: board._id}, board, {upsert: true, new: true}, 
        async (err, savedBoard: Board) => {
            if(err) return res.status(500).send(err);
            return res.status(200).send(savedBoard);
    }).lean();
});

router.route('/boardSelections').get((req,res) => {
    BoardModel.find().lean().then((savedBoards) => {
        const boardNames: BoardSelection[] = savedBoards.map((board) => {
            return {_id: board._id, name: board.name}
        });
        res.status(200).send(boardNames);
    }).catch((err) => {res.status(400).send(err)})
});

router.route('/getAllBoards').get((req,res) => {
    BoardModel.find().lean().then((boards: Board[]) => {
        res.status(200).send(boards);
    }).catch((err) => {res.status(400).send(err)})
});

router.route('/getGameBoard/:_id').get(async (req,res) => {
    const _id: string = req.params._id;
    const board: Board = await BoardModel.findOne({_id: _id}).lean();
    const charIds: string[] = board.chars.map((char: BoardChar) => char._id);
    const dbChars: DbCharacter[] = await Characters.find({_id: {$in: charIds}}).lean();
    const allDbChars: DbCharacter[] = charIds.map(id => dbChars.find(char => char._id == id));
    const gameChars: GameChar[] = [];

    //replace this with dbCharsToGameChars() after party dropdown functionality completely working
    for (let i = 0; i < allDbChars.length; i++) {
        const char: Character = await createOneCharacter(allDbChars[i]);
        const boardChar: BoardChar = board.chars[i];
        if(!boardChar) console.log(`Could not find boardChar in db, charId: ${char._id}`);

        gameChars.push({
            ...char,
            game: {
                gameId: Math.random().toString().substring(2),
                positionIndex: boardChar ? boardChar.index : 0,
                iniRoll: 0,
                isTurn: false,
                attributes: char.attributes,
                stats: char.stats,
                round: {
                    movementTaken: 0,
                    actionTaken: false
                },
                isVisible: false,
                hasBeenSeen: false,
                activeEffects: []
            }
        });
    }

    const gameBoard: GameBoard = {...board, chars: gameChars}
    gameBoard.chars = setVisibility(gameBoard, true).chars;

    res.status(200).send(gameBoard);
});

export default router;