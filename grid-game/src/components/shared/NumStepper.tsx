import './numStepper.css';

import {Attributes} from '../../types';

interface NumStepperInput {
    number: number;
    min: number;
    max: number;
    update: Function;
    attr?: keyof Attributes;
}

export default function NumStepper({number, min, max, update, attr}: NumStepperInput) {
    function increment(amount: number): void {
        const newNumber: number = number + amount;
        if(newNumber >= min && newNumber <= max) {
            if(attr) {
                update(attr, newNumber)
            } else {update(newNumber)}
        }
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
