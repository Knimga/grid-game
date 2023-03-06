import './passiveEditor.css';

import Dropdown from '../shared/Dropdown';
import NumStepper from '../shared/NumStepper';

import { makeInputOptions } from '../../services/detailStrings';
import { getTargetStatType } from '../../services/effects';

import { PassiveEffect } from '../../types/types';
import { EffectTargetStat } from '../../types/enums';
import { InputOption } from '../../types/uiTypes';

interface PassiveEditorInput {
    passiveEffect: PassiveEffect;
    update: Function;
}

export default function PassiveEditor({passiveEffect, update}: PassiveEditorInput) {
    const targetStatOptions: InputOption[] = makeInputOptions(Object.keys(EffectTargetStat));

    function updateTargetStat(newTargetStat: EffectTargetStat): void {
        passiveEffect.targetStat = newTargetStat;
        passiveEffect.targetStatType = getTargetStatType(newTargetStat);
        update({...passiveEffect});
    }

    function updateAmount(newAmount: number): void {
        passiveEffect.amount = newAmount;
        update({...passiveEffect});
    }

  return (
    <div className="passive-editor-pane">
        <Dropdown 
            label="Target Stat" 
            selectedOpt={passiveEffect.targetStat} 
            options={targetStatOptions} 
            update={updateTargetStat}
        />
        <div className="numstepper-row">
            <small>Amount:</small>
            <NumStepper 
                number={passiveEffect.amount}
                min={-20} max = {20}
                update={updateAmount}
            />
        </div>
    </div>
  )
}
