import './gameTab.css'

import {useState, useEffect} from 'react';

import {Button} from '@mui/material';

import GameTab from './GameTab';

import urls from '../../urls';

import { getSpawningIndices } from '../../services/boards';
import { setCharVisibility } from '../../services/los';
import { rollInitiative } from '../../services/roller';

import { DungeonSelection } from '../../uiTypes';
import { GameDungeon, Party, GameBoard, GameChar } from '../../types';

export default function GameController() {
    const [parties, setParties] = useState<Party[]>([]);
    const [dungeonSelections, setDungeonSelections] = useState<DungeonSelection[]>([]);

    const [selectedPartyId, setSelectedPartyId] = useState<string>();
    const [selectedDungeonId, setSelectedDungeonId] = useState<string>();

    const [currentDungeon, setCurrentDungeon] = useState<GameDungeon>();
    const [board, setBoard] = useState<GameBoard>();

    useEffect(() => {
        fetch(urls.localRoot + urls.dungeons.dungeonSelections)
            .then(res => res.json())
            .then((data) => setDungeonSelections(data))
            .catch((err) => console.log(err));

        fetch(urls.localRoot + urls.parties.getAll)
            .then(res => res.json())
            .then((data) => setParties(data))
            .catch((err) => console.log(err));
    },[]);

    async function initiateGame(partyId: string, dungeonId: string, entryId: string) {
        const partyCharsRes = await fetch(urls.localRoot + urls.parties.partyCharsById(partyId));
        const gameDungeonRes = await fetch(urls.localRoot + urls.dungeons.getGameDungeonById(dungeonId));
        const partyChars: GameChar[] = await partyCharsRes.json();
        const gameDungeon: GameDungeon = await gameDungeonRes.json();

        gameDungeon.boards[0] = populateBoard(gameDungeon.boards[0], entryId, partyChars);

        setCurrentDungeon(gameDungeon);
        setBoard(gameDungeon.boards[0]);
    }

    function populateBoard(board: GameBoard, entryPointName: string, currentParty: GameChar[]): GameBoard {
        const newBoard: GameBoard = {...board};
        let spawnIndex: number = 0;

        if(entryPointName === 'portal' && board.portal) {
            spawnIndex = board.portal
        } else {
            spawnIndex = board.doors.find(d => d.name[2] === entryPointName)?.position || 0;
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

    function selectDungeon(_id: string): void {
        const dungeonSelection: DungeonSelection | undefined = dungeonSelections.find(d => d._id === _id);
        if(dungeonSelection) setSelectedDungeonId(_id);
    }

    function startGame(): void {
        if(selectedPartyId && selectedDungeonId) {
            initiateGame(selectedPartyId, selectedDungeonId, 'portal')
        }
    }

    function log(): void {
        console.log(`partyId: ${selectedPartyId}`);
        console.log(`boardId: ${selectedDungeonId}`);
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
            <select onChange={(e) => selectDungeon(e.target.options[e.target.selectedIndex].value)}>
                <option hidden={true}>Select a dungeon...</option>
                {dungeonSelections.map((selection: DungeonSelection) =>
                    <option key={selection._id} value={selection._id}>{selection.name}</option>
                )}
            </select>
            <Button variant="contained" onClick={() => startGame()}>Start Game</Button>
            <button onClick={() => log()}>Log</button>
        </div>
    }

  return (
    <div className="gametab-container">
        {board && currentDungeon ? <GameTab 
            startingBoard={board} 
            colorScheme={{
                wall: currentDungeon.wallColor, 
                floor: currentDungeon.floorColor
            }}/> : gameSetup()}
    </div>
  )
}
