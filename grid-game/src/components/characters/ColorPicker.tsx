import {useState} from 'react';
import { FaCheck } from "react-icons/fa";

import './attributesEditor.css';

interface ColorPickerInput {
    color: string,
    update: Function
}

export default function ColorPicker({color, update}: ColorPickerInput) {
    const [editModeOn, setEditModeOn] = useState<boolean>(false);
    let currentColor: string = color;
    const displayStyle = {backgroundColor: currentColor};

    function click() {setEditModeOn(true)}

    function updateColor(): void {
        update(currentColor);
        setEditModeOn(false);
    }

    function colorInput(): JSX.Element {
        if(editModeOn) {
            return <div className="color-input-row" title="Click to edit">
                <input
                    type="text" 
                    className="color-input"
                    defaultValue={currentColor}
                    onChange={(e) => {currentColor = e.target.value}}
                ></input>
                <button 
                    className="color-change-confirm-button" 
                    onClick={() => updateColor()}
                ><FaCheck /></button>
            </div>
        } else {
            return <div className="color-string-display"  onClick={() => click()}>{color}</div>
        }
    }

  return (
    <div className="color-picker-container">
        <span className="color-input-header">Token Color</span>
        <div className="color-display" style={displayStyle}></div>
        {colorInput()}
    </div>
  )
}
