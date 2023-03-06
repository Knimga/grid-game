import './multiSelector.css';

import { InputOption } from '../../types/uiTypes';

interface MultiSelectorInput {
    label: string;
    options: InputOption[];
    currentlySelected: string[];
    maxSelections: number;
    minSelections: number;
    update: Function;
}

export default function MultiSelector(
    {label, options, currentlySelected, maxSelections, minSelections, update}: MultiSelectorInput
) {
    
    function updateFocus(newSelection: string): void {
        if(valueIsSelected(newSelection) && currentlySelected.length > minSelections) {
            currentlySelected.splice(currentlySelected.indexOf(newSelection), 1);
            update(currentlySelected);
            return;
        }
        
        if(!valueIsSelected(newSelection)) {
            if(currentlySelected.length === maxSelections) currentlySelected.splice(0, 1);
            currentlySelected.push(newSelection);
            update(currentlySelected);
        }
    }

    function valueIsSelected(str: string): boolean {return currentlySelected.includes(str)}
    
  return (
    <div className="multi-selector-container">
        <div className="multi-selector-label"><small>{`${label}:`}</small></div>
        <div className="multi-select-column">
            <div className="multi-select-box">
                {options.map(opt => {
                    return <small 
                        className={`multi-select-item ${!valueIsSelected(opt.enumValue) ? 'gray' : ''}`}
                        key={opt.enumValue}
                        onClick={() => updateFocus(opt.enumValue)}
                    >{opt.displayValue}</small>
                })}
            </div>
        </div>
    </div>
  )
}
