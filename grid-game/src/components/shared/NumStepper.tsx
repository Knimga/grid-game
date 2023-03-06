import './numStepper.css';

import {Attributes} from '../../types/types';

interface NumStepperInput {
    number: number;
    min: number;
    max: number;
    update: Function;
    index?: number;
    attr?: keyof Attributes;
}

export default function NumStepper({number, min, max, update, index, attr}: NumStepperInput) {
    
    function increment(amount: number): void {
        const newNumber: number = number + amount;
        if(newNumber < min || newNumber > max) return;
        if(attr) {update(attr, newNumber); return;}
        if(index !== undefined) {update(newNumber, index); return;}
        update(newNumber);
    }

    return (
    <div className="num-stepper-container">
        <div className="num-display">{number}</div>
        <div className="button-group">
            <button className="increment-button" onClick={() => increment(1)}>+</button>
            <button className="increment-button" onClick={() => increment(-1)}>-</button>
        </div>
    </div>
    )
}
