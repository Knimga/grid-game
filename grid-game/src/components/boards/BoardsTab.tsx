import './boardsTab.css';

import {useState, useEffect} from 'react';
import { FaSave } from 'react-icons/fa';
import {Button} from '@mui/material';

import BoardEdit from './BoardEdit';
import BoardPane from './BoardPane';
import NameInput from '../shared/NameInput';
import DimensionEdit from './DimensionEdit';
import TerrainTool from './TerrainTool';
import CharTool from './CharTool';
import PortalTool from './PortalTool';

import {blankBoard, blankEditorBoard} from '../../services/boards';
import urls from '../../urls';

import {Board} from '../../types';
import { ToolType, Terrain } from '../../uiTypes';

interface BoardCharSelection {
    _id: string;
    name: string;
    color: string;
}

const wall: Terrain = {_id: "12345", name: "wall", color: "#303030"};

export default function BoardsTab() {
    const [boardList, setBoardList] = useState<Board[]>([]);
    const [boardCharSelections, setBoardCharSelections] = useState<BoardCharSelection[]>([]);
    const [selectedBoard, setSelectedBoard] = useState<Board>(blankEditorBoard());
    const [updatesSaved, setUpdatesSaved] = useState<boolean[]>([]);
    const [selectedTool, setSelectedTool] = useState<ToolType>(ToolType.none);
    const [selectedBrush, setSelectedBrush] = useState<BoardCharSelection | Terrain>(wall);

    useEffect(() => {
        const loadBoards = async () => {
            const res = await fetch(urls.localRoot+urls.boards.getAllBoards);
            const boards: Board[] = await res.json();
            setBoardList(boards);
            setUpdatesSaved(Array(boards.length).fill(true));
            setSelectedBoard(boards[0]);
        }
        const loadBoardChars = async () => {
            const res = await fetch(urls.localRoot + urls.characters.getBoardChars);
            const boardChars: BoardCharSelection[] = await res.json();
            setBoardCharSelections(boardChars);
        }
        loadBoards();
        loadBoardChars();
    },[]);

    function updateBoard(board: Board){
        const newBoards: Board[] = [...boardList];
        if(selectedBoard) {
            const boardIndex: number = boardList.indexOf(selectedBoard);
            newBoards[boardIndex] = board;
            updatesSaved[boardIndex] = false;
            setUpdatesSaved(updatesSaved);
            setBoardList(newBoards);
            setSelectedBoard(board);
        } else {console.log('could not find selectedBoard')}
    }

    function updateBoardName(newName: string): void {
        const newBoard: Board = {...selectedBoard};
        newBoard.name = newName;
        updateBoard(newBoard);
    }

    function updateBoardSize(newWidth: number, newHeight: number): void {
        let newBoard: Board = {...selectedBoard};
        const preservedProps = {name: newBoard.name, id: newBoard.id};
        newBoard = {...blankBoard(newWidth, newHeight), ...preservedProps}
        updateBoard(newBoard);
    }

    async function save<Board>(obj: Board): Promise<Board> {
        return fetch(urls.localRoot+urls.boards.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Board})
    }

    function newBoard(): void {setSelectedBoard(blankEditorBoard())}

    function selectBoard(board: Board): void {
        setSelectedBoard(board);
        setSelectedTool(ToolType.none);
    }

    function selectTool(toolType: ToolType): void {
        setSelectedTool(toolType);
    }

    async function saveBoard(board: Board) {
        if(selectedBoard) {
            const newBoard = await save(board);
            const newBoards: Board[] = [...boardList];
            const boardIndex = boardList.indexOf(selectedBoard);

            if(newBoard) {
                if(boardIndex === -1) {
                    newBoards.push(newBoard)
                } else {
                    newBoards[boardIndex] = newBoard;
                    updatesSaved[boardIndex] = true;
                }
                setUpdatesSaved(updatesSaved);
                setBoardList(newBoards);
                setSelectedBoard(newBoard);
            } else {console.log('no char returned from save operation')}
        }
    }

    function isSaved(): boolean {return updatesSaved[boardList.indexOf(selectedBoard)]}

    function clickSquare(index: number): void {
        console.log(index);
        if(selectedTool !== ToolType.none) {
            const newBoard = {...selectedBoard};
            const newBoards: Board[] = [...boardList];
            const boardIndex = boardList.indexOf(selectedBoard);
            if(selectedTool === ToolType.wall) {
                if(selectedBrush.name === 'wall') {
                    if(newBoard.walls.includes(index)) {
                        const indexToRemove: number = newBoard.walls.indexOf(index);
                        newBoard.walls.splice(indexToRemove, 1);
                    } else {newBoard.walls.push(index)}

                    newBoards[boardIndex] = newBoard;
                    updatesSaved[boardIndex] = false;
                    setUpdatesSaved(updatesSaved);
                    setSelectedBoard(newBoard);
                    setBoardList(newBoards);
                }
            } else if(selectedTool === ToolType.character) {
                if(!newBoard.walls.includes(index)) {
                    const charOnIndex = newBoard.chars.find(char => char.index === index);
                    if(charOnIndex) {
                        const indexToRemove: number = newBoard.chars.indexOf(charOnIndex);
                        newBoard.chars.splice(indexToRemove, 1);
                    } else {
                        newBoard.chars.push({
                            _id: selectedBrush._id,
                            name: selectedBrush.name,
                            color: selectedBrush.color,
                            index: index
                        })
                    }
                    newBoards[boardIndex] = newBoard;
                    updatesSaved[boardIndex] = false;
                    setUpdatesSaved(updatesSaved);
                    setSelectedBoard(newBoard);
                    setBoardList(newBoards);
                }
            } else if(selectedTool === ToolType.portal) {
                newBoard.portal = index;
                newBoards[boardIndex] = newBoard;
                updatesSaved[boardIndex] = false;
                setUpdatesSaved(updatesSaved);
                setSelectedBoard(newBoard);
                setBoardList(newBoards);
            }
        }
    }

    function log(): void {console.log(selectedBoard)}
    
  return (
    <div className="tab-container">
        <div className="top-bar">
            <Button 
                variant="contained"
                onClick={() => newBoard()}
            >+ New Board</Button>
            <button onClick={() => log()}>Log</button>
        </div>
        <div className="main-section">        
            <div className="pane-list">
                <span>Boards</span>
                {boardList.map(board => 
                    <BoardPane 
                        board={board}
                        key={board.id}
                        isSelected={selectedBoard.id === board.id}
                        clickPane={selectBoard} 
                    />)
                }
            </div>
            <div className="board-container">
                <BoardEdit 
                    board={selectedBoard}
                    wallColor={'#202020'}
                    floorColor={'#252b57'}
                    clickSquare={clickSquare}
                />
            </div>
            <div className="board-edit-tools">
                <FaSave 
                    className={`board-save-button ${!isSaved() ? 'not-saved' : ''}`} 
                    onClick={() => saveBoard(selectedBoard)}
                />
                <NameInput name={selectedBoard.name} update={updateBoardName} />
                <DimensionEdit 
                    width={selectedBoard.gridWidth} 
                    height={selectedBoard.gridHeight}
                    updateSize={updateBoardSize}
                />
                <TerrainTool 
                    toolIsActive={selectedTool === ToolType.wall}
                    selectTool={selectTool} 
                    setSelectedBrush={setSelectedBrush}
                />
                <CharTool
                    toolIsActive={selectedTool === ToolType.character}
                    chars={boardCharSelections.length ?  boardCharSelections : []}
                    selectTool={selectTool} 
                    setSelectedChar={setSelectedBrush}
                />
                <PortalTool
                    toolIsActive={selectedTool === ToolType.portal}
                    selectTool={selectTool}
                />
            </div>
        </div>
    </div>
  )
}
