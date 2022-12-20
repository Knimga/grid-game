import './gameTab.css'

import {useState, useEffect} from 'react';

import {Button} from '@mui/material';

import GameTab from './GameTab';

import urls from '../../urls';

import { getSpawningIndices } from '../../services/boards';
import { setCharVisibility } from '../../services/los';
import { rollInitiative } from '../../services/roller';

import { BoardSelection } from '../../uiTypes';
import { Party, GameBoard, GameChar } from '../../types';

export default function GameController() {
    const [parties, setParties] = useState<Party[]>([]);
    const [boardSelections, setBoardSelections] = useState<BoardSelection[]>([]);
    const [entryIds, setEntryIds] = useState<string[]>([]);

    const [selectedPartyId, setSelectedPartyId] = useState<string>();
    const [selectedBoardId, setSelectedBoardId] = useState<string>();
    const [selectedEntryId, setSelectedEntryId] = useState<string>();

    const [board, setBoard] = useState<GameBoard>();

    useEffect(() => {
        fetch(urls.localRoot + urls.boards.getSelections)
            .then(res => res.json())
            .then((data) => setBoardSelections(data))
            .catch((err) => console.log(err));

        fetch(urls.localRoot + urls.parties.getAll)
            .then(res => res.json())
            .then((data) => setParties(data))
            .catch((err) => console.log(err));
    },[]);

    async function setPreGameData(partyId: string, boardId: string, entryId: string) {
        const partyCharsRes = await fetch(urls.localRoot + urls.parties.partyCharsById(partyId));
        const gameBoardRes = await fetch(urls.localRoot + urls.boards.getGameBoardById(boardId));
        const gameBoard: GameBoard = await gameBoardRes.json();
        const partyChars: GameChar[] = await partyCharsRes.json();
        setBoard(populateBoard(gameBoard, entryId, partyChars));
    }

    function populateBoard(board: GameBoard, entryPointId: string, currentParty: GameChar[]): GameBoard {
        const newBoard: GameBoard = {...board};
        let spawnIndex: number = 0;

        if(entryPointId === 'portal' && board.portal) {
            spawnIndex = board.portal
        } else {
            spawnIndex = board.doors.find(d => d.id === entryPointId)?.position || 0;
        }

        const spawnIndices: number[] = getSpawningIndices(newBoard, spawnIndex, currentParty.length);

        for (let i = 0; i < spawnIndices.length; i++) {
            const positionedChar: GameChar = currentParty[i];
            positionedChar.game.positionIndex = spawnIndices[i];
            newBoard.chars.push(positionedChar);
        }

        newBoard.chars = setCharVisibility(newBoard);
        newBoard.chars = rollInitiative(newBoard.chars);

        return newBoard;  
    }

    function selectBoard(_id: string): void {
        const boardSelection: BoardSelection | undefined = boardSelections.find(bs => bs._id === _id);
        if(boardSelection) {
            setSelectedBoardId(_id);
            setEntryIds(boardSelection.entryPointIds);
        }
    }

    function startGame(): void {
        if(selectedPartyId && selectedBoardId && selectedEntryId) {
            setPreGameData(selectedPartyId, selectedBoardId, selectedEntryId)
        }
    }

    function log(): void {
        console.log(`partyId: ${selectedPartyId}`);
        console.log(`boardId: ${selectedBoardId}`);
        console.log(`entryId: ${selectedEntryId}`);
    }



    function gameSetup(): JSX.Element {
        return <div className="game-setup-container">
            <select onChange={(e) => setSelectedPartyId(e.target.options[e.target.selectedIndex].value)}>
                <option hidden={true}>Select a party...</option>
                {parties.map((party: Party) =>
                    <option key={party._id} value={party._id}>
                        {party.members.map(m => m.name).join(', ')}
                    </option>
                )}
            </select>
            <select onChange={(e) => selectBoard(e.target.options[e.target.selectedIndex].value)}>
                <option hidden={true}>Select a board...</option>
                {boardSelections.map((selection: BoardSelection) =>
                    <option key={selection._id} value={selection._id}>{selection.name}</option>
                )}
            </select>
            <select 
                disabled={!entryIds.length} 
                onChange={(e) => setSelectedEntryId(e.target.options[e.target.selectedIndex].value)}
            >
                <option hidden={true}>Select an entry point...</option>
                {entryIds.map((id: string) => <option key={id} value={id}>{id}</option>)}
            </select>
            <Button 
                variant="contained"
                onClick={() => startGame()}
            >Start Game</Button>
            <button onClick={() => log()}>Log</button>
        </div>
    }

  return (
    <div className="gametab-container">
        {board ? <GameTab startingBoard={board}/> : gameSetup()}
    </div>
  )
}
