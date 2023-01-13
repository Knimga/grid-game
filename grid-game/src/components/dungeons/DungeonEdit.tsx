import {useState} from 'react';

import DungeonPane from './DungeonPane';
import BoardEdit from './BoardEdit';
import NameInput from '../shared/NameInput';
import DimensionEdit from './DimensionEdit';
import WallTool from './WallTool';
import CharTool from './CharTool';
import PortalTool from './PortalTool';
import DoorTool from './DoorTool';
import DoorPane from './DoorPane';

import { blankBoard, newDoor, doorToBoardMap } from '../../services/boards';
import { doorInputOptions } from '../../services/detailStrings';

import { Dungeon, Board, Door } from '../../types';
import { ToolType, BoardCharSelection, DoorToBoardMap, InputOption } from '../../uiTypes';

interface DungeonEditInput {
    dungeon: Dungeon;
    boardCharSelections: BoardCharSelection[];
    updatesSaved: boolean;
    saveDungeon: Function;
    updateDungeon: Function;
}

export default function DungeonEdit(
    {dungeon, boardCharSelections, updatesSaved, saveDungeon, updateDungeon}: DungeonEditInput
) {
    const [selectedBoard, setSelectedBoard] = useState<Board>(dungeon.boards[0]);
    const [selectedTool, setSelectedTool] = useState<ToolType>(ToolType.wall);
    const [selectedChar, setSelectedChar] = useState<BoardCharSelection>();
    const doorSelectOptions: InputOption[] = doorInputOptions(dungeon);
    const doorBoardMap: DoorToBoardMap[] = doorToBoardMap(dungeon);

    function selectBoard(board: Board): void {
        if(board.id !== selectedBoard.id) setSelectedBoard(board)
    }

    function addBoard(): void {
        dungeon.boards.push(blankBoard(15,15));
        updateDungeon(dungeon);
    }

    function updateBoardName(newName: string): void {
        dungeon.boards[selectedBoardIndex()].name = newName;
        updateDungeon(dungeon);
    }

    function updateBoardSize(newWidth: number, newHeight: number): void {
        const newBoard = {
            ...blankBoard(newWidth, newHeight),
            id: selectedBoard.id,
            name: selectedBoard.name
        }

        dungeon.boards[selectedBoardIndex()] = newBoard;

        updateDungeon(dungeon);
        setSelectedBoard(newBoard);
    }

    function updateDoor(newDoor: Door, index: number, updatingLeadsTo?: boolean): void {
        selectedBoard.doors[index] = newDoor;
        dungeon.boards[selectedBoardIndex()] = selectedBoard;

        if(updatingLeadsTo) {
            updateDoorLeadsTo(newDoor, index)
        } else {
            selectedBoard.doors[index] = newDoor;
            dungeon.boards[selectedBoardIndex()] = selectedBoard;
            updateDungeon(dungeon);
        }
    }

    function updateDoorLeadsTo(newDoor: Door, index: number): void {
        dungeon.boards[selectedBoardIndex()].doors[index] = newDoor;

        const targetDoorMap: DoorToBoardMap | undefined = doorBoardMap
            .find(map => map.doorId === newDoor.leadsTo.doorId);

        if(targetDoorMap) {
            dungeon.boards[targetDoorMap.boardIndex].doors[targetDoorMap.doorIndex].leadsTo = {
                boardId: selectedBoard.id, doorId: newDoor.id
            }
        }

        updateDungeon(dungeon);
    }

    function clickSquare(index: number): void {
        const objectPlaceable: boolean = !selectedBoard.walls.includes(index);
        switch(selectedTool) {
            case ToolType.wall: wallToolClick(index); break;
            case ToolType.character: if(objectPlaceable) charToolClick(index); break;
            case ToolType.portal: if(objectPlaceable) portalToolClick(index); break;
            case ToolType.door: if(objectPlaceable) doorToolClick(index); break;
            default: break;
        }
    }

    function wallToolClick(index: number): void {
        if(selectedBoard.walls.includes(index)) {
            const indexToRemove: number = selectedBoard.walls.indexOf(index);
            selectedBoard.walls.splice(indexToRemove, 1);
        } else {selectedBoard.walls.push(index)}

        dungeon.boards[selectedBoardIndex()] = selectedBoard;
        updateDungeon(dungeon);
    }

    function charToolClick(index: number): void {
        if(selectedChar) {
            const charOnIndex = selectedBoard.chars.find(char => char.index === index);

            if(charOnIndex) {
                const indexToRemove: number = selectedBoard.chars.indexOf(charOnIndex);
                selectedBoard.chars.splice(indexToRemove, 1);
            } else {selectedBoard.chars.push({...selectedChar, index: index})}

            dungeon.boards[selectedBoardIndex()] = selectedBoard;
            updateDungeon(dungeon);
        }
    }

    function portalToolClick(index: number): void {
        const thisBoardIndex: number = selectedBoardIndex();
        if(selectedBoard.portal === index && thisBoardIndex !== 0) {
            delete selectedBoard.portal;
            dungeon.boards[thisBoardIndex] = selectedBoard;
        } else {
            selectedBoard.portal = index;
            dungeon.boards[thisBoardIndex] = selectedBoard;
        } 
        updateDungeon(dungeon);
    }

    function doorToolClick(index: number): void {
        const existingDoorIndices: number[] = selectedBoard.doors.map(d => d.position);
        if(!existingDoorIndices.includes(index)) {
            selectedBoard.doors.push(newDoor(dungeon.name, selectedBoard.name, index))
        } else {
            const doorToRemove: Door | undefined = selectedBoard.doors.find(d => d.position === index);
            if(doorToRemove) {
                const indexToRemove: number = selectedBoard.doors.indexOf(doorToRemove);
                selectedBoard.doors.splice(indexToRemove, 1);
            }
        }
        dungeon.boards[selectedBoardIndex()] = selectedBoard;
        updateDungeon(dungeon);
    }

    function selectedBoardIndex(): number {
        const board = dungeon.boards.find(b => b.id === selectedBoard.id);
        if(board) {
            return dungeon.boards.indexOf(board)
        } else {console.log('could not find board'); return -1}
    }

  return (
    <div className="main-section">
        <div className="pane-list">
            <DungeonPane 
                dungeon={dungeon} 
                updatesSaved={updatesSaved} 
                update={updateDungeon}
                save={saveDungeon}
                addBoard={addBoard}
                selectBoard={selectBoard}
            />
        </div>
        <div className="board-container">
            <BoardEdit 
                board={selectedBoard}
                wallColor={dungeon.wallColor}
                floorColor={dungeon.floorColor}
                clickSquare={clickSquare}
            />
        </div>
        <div className="dungeon-board-edit-tools">
            <NameInput name={selectedBoard.name} update={updateBoardName} />
            <DimensionEdit 
                width={selectedBoard.gridWidth} 
                height={selectedBoard.gridHeight}
                updateSize={updateBoardSize}
            />
            <WallTool 
                toolIsActive={selectedTool === ToolType.wall}
                wallColor={dungeon.wallColor}
                selectTool={setSelectedTool}
            />
            <CharTool
                toolIsActive={selectedTool === ToolType.character}
                chars={boardCharSelections}
                selectTool={setSelectedTool}
                setSelectedChar={setSelectedChar}
            />
            <PortalTool
                toolIsActive={selectedTool === ToolType.portal}
                selectTool={setSelectedTool}
            />
            <DoorTool
                toolIsActive={selectedTool === ToolType.door}
                selectTool={setSelectedTool}
            />
            <div className="door-list">
                <strong>Doors</strong>
                {
                    selectedBoard.doors.map((door, index) => 
                        <DoorPane 
                            door={door} 
                            index={index}
                            inputOptions={doorSelectOptions}
                            doorToBoardMap={doorBoardMap}
                            update={updateDoor}
                            key={door.id}
                        />)
                }
            </div>
        </div>
        
    </div>
  )
}
