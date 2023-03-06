import './dropdown.css';

import {InputOption} from '../../types/uiTypes';

interface DropdownInput {
    label: string;
    selectedOpt: string;
    options: InputOption[];
    hideLabel?: boolean;
    index?: number;
    update: Function;
}

export default function Dropdown(
    {label, selectedOpt, options, hideLabel, index, update}: DropdownInput
) {
    const dropdownContainerClass: string = hideLabel ? 'full-width' : 'shorter-width';

    function makeUpdate(newValue: string): void {
        if(index !== undefined) {update(newValue, index); return;}
        update(newValue);
    }

    function dropdownLabel(): JSX.Element {
        return <div className="dropdown-label">
            <small>{label + (label.length ? ':' : '')}</small>
        </div>
    }

  return (
    <div className="dropdown-container">
        {hideLabel ? '' : dropdownLabel()}
        
        <div className={`dropdown-select-container ${dropdownContainerClass}`}>
            <select 
                className="dropdown-selector" 
                value={selectedOpt}
                onChange={(e) => makeUpdate(e.target.value)}
            >
                {options.map(opt => 
                    <option key={Math.random()} value={opt.enumValue}>{opt.displayValue}</option>
                )}
            </select>
        </div>
    </div>
  )
}
