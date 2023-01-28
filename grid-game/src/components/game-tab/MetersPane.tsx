import './meters.css';

import {useState} from 'react';

import { GameChar, Meters } from '../../types/types';

interface MetersInput {chars: GameChar[]}

export default function MetersPane({chars}: MetersInput) {
    const [keysIndex, setKeysIndex] = useState<number>(0);
    const meterKeys: (keyof Meters)[] = ['threat','dmgDone', 'dmgTaken', 'healingDone'];
    const sortedChars: GameChar[] = [...chars].sort( //wow... if I don't use [...chars], it sorts the chars in GameTab.tsx...
        (a: GameChar, b: GameChar) => b.game.meters[meterKeys[keysIndex]] - a.game.meters[meterKeys[keysIndex]]
    );
    
    function headerString(): string {
        switch(meterKeys[keysIndex]) {
            case 'dmgDone': return 'Damage Done';
            case 'dmgTaken': return 'Damage Taken';
            case 'healingDone': return 'Healing Done';
            case 'threat': return 'Threat';
            default: return 'Damage Done';
        }
    }

    function switchMeterType(): void {
        setKeysIndex(keysIndex === meterKeys.length - 1 ? 0 : keysIndex + 1)
    }

    function barStyle(char: GameChar): Object {
        const maxValue: number = sortedChars[0].game.meters[meterKeys[keysIndex]];
        return {
            backgroundColor: char.color,
            width: `${maxValue ? (char.game.meters[meterKeys[keysIndex]] / maxValue) * 100 : 0}%`
        }
    }

    function meterRow(char: GameChar): JSX.Element {
        return <div className='meter-row' key={char.game.gameId}>
            <span className='meter-charname'>
                {char.name}
            </span>
            <div className='meter-bar-container'>
                <div className='meter-bar' style={barStyle(char)}></div>
            </div>
            <div className='meter-value'>{char.game.meters[meterKeys[keysIndex]]}</div>
        </div>
    }

  return (
    <div className="meters">
        <span className="meters-header" onClick={() => switchMeterType()}>{headerString()}</span>
        <div className='meters-list-container'>
            {
                meterKeys[keysIndex] === 'threat' ? 
                sortedChars.filter(c => c.type === 'player').map(c => meterRow(c))
                    : sortedChars.map(c => meterRow(c))
            }
        </div>
    </div>
  )
}
