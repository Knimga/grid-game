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
            const res = await fetch(urls.localRoot+urls.characters.getBoardChars);
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

    function updateBoardWidth(newWidth: number): void {
        let newBoard: Board = {...selectedBoard};
        const preservedProps = newBoard._id ? 
            {name: newBoard.name, _id: newBoard._id} : {name: newBoard.name};
        newBoard = {
            ...blankBoard(newWidth, newBoard.gridHeight), 
            ...preservedProps
        }
        updateBoard(newBoard);
    }

    function updateBoardHeight(newHeight: number): void {
        let newBoard: Board = {...selectedBoard};
        const preservedProps = newBoard._id ? 
            {name: newBoard.name, _id: newBoard._id} : {name: newBoard.name};
        newBoard = {
            ...blankBoard(newBoard.gridWidth, newHeight), 
            ...preservedProps
        }
        updateBoard(newBoard);
    }

    async function save<Board>(obj: Board): Promise<Board> {
        return fetch(urls.localRoot+urls.boards.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Board})
    }

    function newBoard(): void {
        setSelectedBoard(blankEditorBoard());
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
        if(selectedTool !== ToolType.none) {
            const newBoard = {...selectedBoard};
            const newBoards: Board[] = [...boardList];
            const boardIndex = boardList.indexOf(selectedBoard);
            if(selectedTool === ToolType.terrain) {
                if(selectedBrush.name === 'wall') {
                    if(newBoard.walls.includes(index)) {
                        const indexToRemove: number = newBoard.walls.indexOf(index);
                        newBoard.walls.splice(indexToRemove, 1);
                    } else {
                        newBoard.walls.push(index)
                    }
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

            }
        }
    }
    
  return (
    <div className="boardstab-container">
        <div className="top-bar">
            <Button 
                variant="contained"
                onClick={() => newBoard()}
            >+ New Board</Button>
        </div>
        <div className="middle">        
            <div className="board-list">
                <span>Boards</span>
                {boardList.map(board => 
                    <BoardPane 
                        board={board}
                        key={board._id}
                        isSelected={selectedBoard._id === board._id}
                        clickPane={setSelectedBoard} 
                    />)
                }
            </div>
            <div className="board-container">
                <BoardEdit board={selectedBoard} clickSquare={clickSquare} />
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
                    updateWidth={updateBoardWidth}
                    updateHeight={updateBoardHeight}
                />
                <TerrainTool 
                    toolIsActive={selectedTool === ToolType.terrain}
                    setSelectedTool={setSelectedTool} 
                    setSelectedBrush={setSelectedBrush}
                />
                <CharTool
                    toolIsActive={selectedTool === ToolType.character}
                    chars={boardCharSelections.length ?  boardCharSelections : []}
                    setSelectedTool={setSelectedTool} 
                    setSelectedBrush={setSelectedBrush}
                />
            </div>
            
        </div>
    </div>
  )
}
