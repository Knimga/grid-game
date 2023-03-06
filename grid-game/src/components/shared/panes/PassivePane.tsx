import './passivePane.css';

import { passiveEffectString, randId } from '../../../services/detailStrings';

import { Passive } from '../../../types/types';
import { DamageTypeColor } from '../../../types/enums';

interface PassivePaneInput {
    passive: Passive;
    onClick?: Function;
    isSelected?: boolean;
}

export default function PassivePane({passive, onClick, isSelected}: PassivePaneInput) {

    function click(): void {if(onClick) onClick(passive)}

  return (
    <div className={`passive-pane ${isSelected ? 'passive-pane-selected' : ''}`} onClick={() => click()}>
        <div className="passive-body">
            <div className="passive-label" style={{color: DamageTypeColor[passive.dmgType]}}>
                <small>{passive.name}</small>
            </div>
            <div className="passive-values">
                {passive.effects.map(e => <small key={randId()}>{passiveEffectString(e)}</small>)}
            </div>
        </div>
    </div>
  )
}
