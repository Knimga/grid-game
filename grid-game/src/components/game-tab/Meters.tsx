import './meters.css';

import {useState} from 'react';

import { MetersEntry, MeterTypes } from '../../uiTypes';

interface MetersInput {meters: MetersEntry[]}

export default function Meters({meters}: MetersInput) {
    const [keysIndex, setKeysIndex] = useState<number>(0);
    const meterKeys: (keyof MeterTypes)[] = ['threat','dmgDone', 'dmgTaken', 'healingDone'];
    const sortedMeters: MetersEntry[] = meters.sort(
        (a: MetersEntry, b: MetersEntry) => b.meters[meterKeys[keysIndex]] - a.meters[meterKeys[keysIndex]]
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

    function barStyle(metersEntry: MetersEntry): Object {
        const maxValue: number = sortedMeters[0].meters[meterKeys[keysIndex]];
        return {
            backgroundColor: metersEntry.color,
            width: `${maxValue ? (metersEntry.meters[meterKeys[keysIndex]] / maxValue) * 100 : 0}%`
        }
    }

    function meterRow(metersEntry: MetersEntry): JSX.Element {
        return <div className='meter-row' key={metersEntry.gameId}>
            <span className='meter-charname'>
                {metersEntry.charName}
            </span>
            <div className='meter-bar-container'>
                <div className='meter-bar' style={barStyle(metersEntry)}></div>
            </div>
            <div className='meter-value'>{metersEntry.meters[meterKeys[keysIndex]]}</div>
        </div>
    }

  return (
    <div className="meters">
        <span className="meters-header" onClick={() => switchMeterType()}>{headerString()}</span>
        <div className='meters-list-container'>
            {
                meterKeys[keysIndex] === 'threat' ? 
                    sortedMeters.filter(meter => meter.charType === 'player').map(metersEntry => meterRow(metersEntry))
                    : sortedMeters.map(metersEntry => meterRow(metersEntry))
            }
        </div>
    </div>
  )
}
