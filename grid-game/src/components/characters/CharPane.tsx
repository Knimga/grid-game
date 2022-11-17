import './charPane.css';

import { FaCircle } from 'react-icons/fa';

import {Character} from '../../types';

import {cap} from '../../services/detailStrings';

interface CharPaneInput {
    char: Character,
    isSelected: boolean,
    selectChar: Function
}

export default function CharPane({char, isSelected, selectChar}: CharPaneInput) {
    const nameStyle: Object = {color: char.color};

  return (
    <div className={`char-pane ${isSelected ? 'selected' : ''}`} onClick={() => {selectChar(char)}}>
        <div className="inner-container">
            <div className="char-label">
                <FaCircle style={nameStyle} /><strong className="char-name">{char.name}</strong>
            </div>
            <div className="char-details">
                <small className="gray-italic">{`${char.class.name} - Level ${char.level}`}</small>
                <small className="gray-italic">{cap(char.type)}</small>
            </div>
        </div>
    </div>
  )
}
