import './dungeonPane.css';

import BoardPane from './BoardPane';
import NameInput from '../shared/NameInput';
import ColorPicker from '../shared/ColorPicker';

import { FaSave } from 'react-icons/fa';
import { randId } from '../../services/detailStrings';

import { Dungeon } from '../../types/types';
import { useState } from 'react';

interface DungeonsPaneInput {
    dungeon: Dungeon,
    updatesSaved: boolean,
    update: Function,
    save: Function,
    addBoard: Function,
    selectBoard: Function
}

export default function DungeonPane({dungeon, updatesSaved, update, save, addBoard, selectBoard}: DungeonsPaneInput) {
    const [selectedBoardIndex, setSelectedBoardIndex] = useState<number>(0);

    function updateName(newName: string): void {
        dungeon.name = newName;
        update(dungeon);
    }

    function updateWallColor(newColor: string): void {
        dungeon.wallColor = newColor;
        update(dungeon);
    }

    function updateFloorColor(newColor: string): void {
        dungeon.floorColor = newColor;
        update(dungeon);
    }

    function clickBoard(i: number): void {
        setSelectedBoardIndex(i);
        selectBoard(dungeon.boards[i]);
    }

  return (
    <div className="dungeon-pane">
        <FaSave 
            className={`save-button ${updatesSaved ? '' : 'unsaved'}`} 
            onClick={() => save()}
        />
        <NameInput name={dungeon.name} update={updateName} />
        <div className="space-around-flex-row">
            <ColorPicker label={"Wall Color"} color={dungeon.wallColor} update={updateWallColor} />
            <ColorPicker label={"Floor Color"} color={dungeon.floorColor} update={updateFloorColor} />
        </div>
        <hr style={{width: '95%'}} />
        <div className='space-around-flex-row'>
            <strong>Boards</strong>
            <button onClick={() => addBoard()}>+ New</button>
        </div>
        <div className='board-list'>
            {dungeon.boards.map((board, index) => 
                <BoardPane 
                    board={board} 
                    wallColor={dungeon.wallColor} 
                    floorColor={dungeon.floorColor}
                    isSelected={index === selectedBoardIndex}
                    index={index}
                    clickBoard={clickBoard} 
                    key={randId()}
                />)
            }
        </div>
    </div>
  )
}
