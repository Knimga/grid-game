import './passiveEffectPane.css';

import { FaTrashAlt } from "react-icons/fa";

import { passiveEffectString, randId } from '../../services/detailStrings';

import { PassiveEffect } from '../../types/types';
import { DamageTypeColor } from '../../types/enums';

interface PassiveEffectPaneInput {
    passive: PassiveEffect;
    index: number;
    removePassiveEffect?: Function;
}

export default function PassiveEffectPane({passive, index, removePassiveEffect}: PassiveEffectPaneInput) {

    function deleteButton(): JSX.Element {
        if(!removePassiveEffect) return <></>;
        return <div className="passive-effect-icon-container">
            <FaTrashAlt className="clickable-icons" onClick={() => removePassiveEffect(index)} />
        </div>
    }

  return (
    <div className="passive-effect-pane">
        <div className="passive-effect-body">
            <div className="passive-effect-label" style={{color: DamageTypeColor[passive.dmgType]}}>
                <small>{passive.name}</small>
            </div>
            <div className="passive-effect-values">
                {passive.effects.map(e => <small key={randId()}>{passiveEffectString(e)}</small>)}
            </div>
        </div>
        {deleteButton()}
    </div>
  )
}
