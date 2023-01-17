import './attrFocusSelector.css';

import { useState } from 'react';

import { AttributeFocus } from "../../types/types";
import { AttributeEnum } from '../../types/enums';

import {cap} from '../../services/detailStrings';

interface AttrFocusSelectorInput {
    currentFoci: AttributeFocus,
    update: Function
}

export default function AttrFocusSelector({currentFoci, update}: AttrFocusSelectorInput) {
    const [editIndex, setEditIndex] = useState<number>(0);
    const attributes: AttributeEnum[] = Object.values(AttributeEnum);

    function updateFocus(newAttr: AttributeEnum): void {
        if(!currentFoci.includes(newAttr)) {
            currentFoci[editIndex] = newAttr;
            update(currentFoci);
            setEditIndex(editIndex === 0 ? 1 : 0);
        }
    }
    
  return (
    <div className="attr-focus-selector-container">
        <div className="attr-focus-selector-label"><small>Attribute Focus:</small></div>
        <div className="attr-focus-select-column">
            <div className="attr-focus-select-box">
                {attributes.map(attr => {
                    return <small 
                        className={`attr-focus-item ${!currentFoci.includes(attr) ? 'gray' : ''}`}
                        key={attr}
                        onClick={() => updateFocus(attr)}
                    >{cap(attr)}</small>
                })}
            </div>
        </div>
    </div>
  )
}
