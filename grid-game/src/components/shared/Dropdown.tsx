import './dropdown.css';

import {InputOption} from '../../uiTypes';

interface DropdownInput {
    label: string,
    selectedOpt: string,
    options: InputOption[],
    hideLabel?: boolean,
    update: Function
}

export default function Dropdown({label, selectedOpt, options, hideLabel, update}: DropdownInput) {

    const dropdownContainerClass: string = hideLabel ? 'full-width' : 'shorter-width';

  return (
    <div className="dropdown-container">
        {
            hideLabel ? '' : 
            <div className="dropdown-label">
                <small>{label + (label.length ? ':' : '')}</small>
            </div> 

        }
        
        <div className={`dropdown-select-container ${dropdownContainerClass}`}>
            <select 
                className="dropdown-selector" 
                value={selectedOpt}
                onChange={(e) => update(e.target.value)}
            >
                {options.map(opt => 
                    <option key={Math.random()} value={opt.enumValue}>{opt.displayValue}</option>
                )}
            </select>
        </div>
    </div>
  )
}
