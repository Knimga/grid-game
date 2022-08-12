import {Roll, RollResult } from '../types';

function rand(max: number): number {return Math.floor(Math.random() * max) + 1}

export function rollDie({numDie, dieSides, mod}: Roll): RollResult {
    let result: number = 0, stringComponents: string[] = [];

    for(let i = 0; i < numDie; i++) {
        let roll: number = rand(dieSides);
        result += roll;
        stringComponents.push(`d${dieSides}(${roll})`);
    }

    stringComponents.push(`${mod}`);
    result += mod;
    
    return {result: result, summary: stringComponents.join(' + ')};
}

export function rollD20(mod: number): RollResult {return rollDie({numDie: 1, dieSides: 20, mod: mod})}
