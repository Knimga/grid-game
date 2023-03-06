import {useState} from 'react';
import { FaCheck } from "react-icons/fa";

import './nameInput.css';

interface NameInputInputlol {
    name: string;
    label: string;
    update: Function;
    fontSize?: number;
    nameTextColor?: string;
}

export default function NameInput({name, label, fontSize, update, nameTextColor}: NameInputInputlol) {
    const [editModeOn, setEditModeOn] = useState<boolean>(false);
    let currentName: string = name;

    function nameDisplayStyle(): Object {
        return {fontSize: `${fontSize || 125}%`, color: nameTextColor || ''}
    }

    function updateName(): void {
        update(currentName);
        setEditModeOn(false);
    }

    function nameElement(): JSX.Element {
        if(editModeOn) {
            return <div className="name-input-row" title="Click to edit">
                <input 
                    type="text" 
                    className="name-input"
                    defaultValue={currentName}
                    onChange={(e) => {currentName = e.target.value}}
                ></input>
                <button className="name-change-confirm-button" onClick={() => updateName()}><FaCheck /></button>
            </div>
        } else {
            return <div 
                className="name-display" 
                onClick={() => setEditModeOn(true)} 
                style={nameDisplayStyle()}
            >{name}</div>
        }
    }

  return (
    <div className="name-wrapper">
        {nameElement()}
        <small className="name-label">{label}</small>
    </div>
  )
}
