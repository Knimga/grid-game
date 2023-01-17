import './dungeonsTab.css';

import {useState, useEffect} from 'react';

import {Button} from '@mui/material';

import urls from '../../urls';

import DungeonEdit from './DungeonEdit';

import { makeInputOptionsWithIds } from '../../services/detailStrings';
import { blankDungeon } from '../../services/dungeons';

import { Dungeon } from '../../types/types';
import { InputOption, BoardCharSelection } from '../../types/uiTypes';

export default function DungeonsTab() {
    const [dungeons, setDungeons] = useState<Dungeon[]>([]);
    const [dungeonInputOptions, setDungeonInputOptions] = useState<InputOption[]>([]);
    const [selectedDungeon, setSelectedDungeon] = useState<Dungeon>();
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);
    const [boardCharSelections, setBoardCharSelections] = useState<BoardCharSelection[]>([]);

    useEffect(() => {
        fetch(urls.localRoot + urls.dungeons.getAll)
            .then(res => res.json())
            .then((data) => {
                setDungeons(data);
                setDungeonInputOptions(makeInputOptionsWithIds(data));
            }).catch((err) => console.log(err));
        fetch(urls.localRoot + urls.characters.getBoardChars)
            .then(res => res.json())
            .then((data) => setBoardCharSelections(data))
            .catch((err) => console.log(err));
    },[]);

    function newDungeon(): void {setSelectedDungeon(blankDungeon())}

    async function save<Dungeon>(obj: Dungeon): Promise<Dungeon> {
        return fetch(urls.localRoot+urls.dungeons.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Dungeon})
    }

    async function saveDungeon() {
        if(selectedDungeon) {
            const newDungeon = await save(selectedDungeon);
            const newDungeons: Dungeon[] = [...dungeons];
            const dungeonIndex = newDungeons.indexOf(newDungeon);

            if(newDungeon) {
                if(dungeonIndex === -1) {
                    newDungeons.push(newDungeon)
                } else {
                    newDungeons[dungeonIndex] = newDungeon;
                    //updatesSaved[dungeonIndex] = true;
                }

                setDungeons(newDungeons);
                setSelectedDungeon(newDungeon);
                setUpdatesSaved(true);
            } else {console.log('no dungeon returned from save operation')}
        }
    }

    function updateDungeon(newDungeon: Dungeon): void {
        setSelectedDungeon({...newDungeon});
        setUpdatesSaved(false);
    }

    function selectDungeon(_id: string): void {
        const dungeon: Dungeon | undefined = dungeons.find(d => d._id === _id);
        if(dungeon) setSelectedDungeon(dungeon);
    } 

    function dungeonEdit(): JSX.Element {
        if(selectedDungeon) {
            return <DungeonEdit 
                dungeon={selectedDungeon}
                boardCharSelections={boardCharSelections}
                updatesSaved={updatesSaved}
                saveDungeon={saveDungeon}
                updateDungeon={updateDungeon}
            />
        } else {return <></>}
    }

    function log(): void {console.log(selectedDungeon)}

  return (
    <div className="tab-container">
        <div className="top-bar">
            <select onChange={(e) => selectDungeon(e.target.options[e.target.selectedIndex].value)}>
                <option hidden={true}>Select a dungeon...</option>
                {dungeonInputOptions.map(opt => 
                    <option key={opt.enumValue} value={opt.enumValue}>{opt.displayValue}</option>
                )}
            </select>
            <Button variant="contained" onClick={() => newDungeon()}>+ New Dungeon</Button>
            <button onClick={() => log()}>Log</button>
        </div>
        {dungeonEdit()}
    </div>
  )
}
