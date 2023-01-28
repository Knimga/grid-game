import './charTool.css';

import { useState } from 'react';

import { FaSkull } from 'react-icons/fa';

import Dropdown from '../shared/Dropdown';

import {makeInputOptionsWithIds} from '../../services/detailStrings';

import {BoardCharSelection, ToolType, InputOption} from '../../types/uiTypes';

interface CharToolInput {
    toolIsActive: boolean;
    chars: BoardCharSelection[];
    selectedCharIsBoss: boolean;
    selectTool: Function;
    setSelectedChar: Function;
    setIsBoss: Function;
}

export default function CharTool({
    toolIsActive, chars, selectedCharIsBoss, selectTool, setSelectedChar, setIsBoss
}: CharToolInput) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const style = {backgroundColor: chars.length ? chars[selectedIndex].color : ''};
    const sortedChars: BoardCharSelection[] = chars.sort(
        (a: BoardCharSelection, b: BoardCharSelection) => a.name > b.name ? 1 : -1
    );

    const charInputOptions: InputOption[] = makeInputOptionsWithIds(sortedChars);

    function toggleActive(): void {
        toolIsActive = !toolIsActive;
        selectTool(toolIsActive ? ToolType.character : ToolType.none); 
    }

    function update(newId: string): void {
        const newChar: BoardCharSelection | undefined = chars.find(char => char._id === newId);
        if(newChar) {
            const index = chars.indexOf(newChar);
            selectTool(ToolType.character);
            setSelectedIndex(index);
            setSelectedChar(chars[index]);
        }   
    }

  return (
    <div className="char-tool-container">
        <div 
            className={`brush-box ${toolIsActive ? 'outline' : ''}`} 
            onClick={() => toggleActive()}
            style={style}
        >
            {selectedCharIsBoss ? <FaSkull/> : ''}
        </div>
        <Dropdown 
            label=""
            selectedOpt={charInputOptions.length ? charInputOptions[selectedIndex].enumValue: 'yup'}
            options={charInputOptions}
            update={update}
            hideLabel={true}
        />
        <div className='flex-align-center'>
            <input type="checkbox" checked={selectedCharIsBoss} onChange={() => setIsBoss()} />
            <small>Is boss?</small>
        </div>
    </div>
  )
}
