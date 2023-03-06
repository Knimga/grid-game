import './textAreaInput.css';

import { useState } from 'react';

interface TextAreaInputInputlol {
    textValue: string;
    label?: string;
    update: Function;
}

export default function TextAreaInput({textValue, label, update}: TextAreaInputInputlol) {
    const [editModeOn, setEditModeOn] = useState<boolean>(false);
    let text: string = textValue;

    function saveChanges(): void {
        update(text);
        setEditModeOn(false);
    }

    function displayText(): JSX.Element {
        return <div 
                className="text-area-display-text"
                onClick={() => setEditModeOn(true)}
            >
            {textValue}
        </div>
    }

    function textEdit(): JSX.Element {
        return <div>
            <textarea 
                className="text-area-textarea-element"
                rows={5} cols={25}
                spellCheck={false}
                defaultValue={text}
                onChange={(e) => {text = e.target.value}}
            ></textarea>
            <div className="text-area-button-row">
                <button onClick={() => saveChanges()}>Save</button>
            </div>
        </div>
    }

  return (
    <div className="text-area-input-container">
        <small>{label ? label+':' : ''}</small>
        {editModeOn ? textEdit() : displayText()}
    </div>
  )
}
