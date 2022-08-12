import './clickSwitch.css';

import {InputOption} from '../../uiTypes';

interface ClickSwitchInput {
    label: string,
    currentValue: string,
    options: InputOption[]
    update: Function,
    centerAlignLabel?: boolean,
    leftAlignValue?: boolean
}

export default function ClickSwitch({
    label, currentValue, options, update, centerAlignLabel, leftAlignValue
}: ClickSwitchInput) {
    const currentOption: InputOption | undefined = options.find(opt => opt.enumValue === currentValue);
    if(!currentOption) console.log('option doesnt exist!');
    const currentIndex: number = currentOption ? options.indexOf(currentOption) : -1;

    const labelAlignment: string = centerAlignLabel ? 'center' : 'flex-end';
    const valueAlignment: string = leftAlignValue ? 'flex-start' : 'center';

    function click(): void {
        const nextIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
        update(options[nextIndex].enumValue);
    }

  return (
    <div className="switch-row">
        <div className={`switch-label ${labelAlignment}`}>
            <small>{label + ':'}</small>
        </div>
        <div className={`switch-value ${valueAlignment}`} onClick={() => click()}>
            <small>{currentOption ? currentOption.displayValue : ''}</small>
        </div>
    </div>
  )
}
