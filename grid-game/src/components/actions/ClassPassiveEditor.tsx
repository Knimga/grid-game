import './classPassiveEditor.css';

import { FaSave, FaTrashAlt } from 'react-icons/fa';

import NameInput from '../shared/NameInput';
import Dropdown from '../shared/Dropdown';
import NumStepper from '../shared/NumStepper';

import { makeInputOptions, randId } from '../../services/detailStrings';
import { getTargetStatType } from '../../services/effects';

import { Passive, PassiveEffect } from "../../types/types";
import { DamageTypeColor, DamageType, EffectTargetStat, TargetStatType } from '../../types/enums';
import { InputOption } from '../../types/uiTypes';

interface ClassPassiveEditorInput {
    passive: Passive;
    update: Function;
    save: Function;
}

export default function ClassPassiveEditor({passive, update, save}: ClassPassiveEditorInput) {
    const dmgTypeOptions: InputOption[] = makeInputOptions(Object.keys(DamageType));
    const targetStatTypeOptions: InputOption[] = makeInputOptions(Object.keys(EffectTargetStat));
    //const threatMultiplierValue: number | null = null;

    function updateName(newName: string): void {update({...passive, name: newName})}
    function updateDmgType(newDmgType: DamageType): void {update({...passive, dmgType: newDmgType})}

    function updateTargetStat(newTargetStat: EffectTargetStat, index: number): void {
        passive.effects[index].targetStat = newTargetStat;
        passive.effects[index].targetStatType = getTargetStatType(newTargetStat);
        update({...passive});
    }

    function updateAmount(newAmount: number, effectIndex: number): void {
        let amount: number | null = null;
        passive.effects[effectIndex].amount = amount || newAmount;
        update({...passive});
    }

    function addEffect(): void {
        const newEffect: PassiveEffect = {
            targetStat: EffectTargetStat.ac, 
            amount: 1, 
            targetStatType: TargetStatType.stat
        };
        update({...passive, effects: [...passive.effects, newEffect]});
    }

    function removeEffect(index: number): void {
        if(passive.effects.length === 1) return;
        passive.effects.splice(index, 1);
        update({...passive});
    }

    function passiveEffect(pe: PassiveEffect, index: number): JSX.Element {
        return <div className="class-passive-effect-editor-pane" key={randId()}>
            <FaTrashAlt 
                className="trash-icon class-passive-trash-icon"
                onClick={() => removeEffect(index)}
            />
            <Dropdown 
                label="TargetStat"
                options={targetStatTypeOptions}
                selectedOpt={pe.targetStat}
                update={updateTargetStat}
                index={index}
            />
            <NumStepper 
                number={pe.amount}
                min={-100} max={100}
                update={updateAmount}
                index={index}
            />
        </div>
    }

  return (
    <div className="class-passive-editor-pane">
        <FaSave 
            className="class-passive-save-icon save-button"
            onClick={() => save(passive)}
        />
        <NameInput 
            name={passive.name}
            label="Passive Name"
            fontSize={100}
            update={updateName}
            nameTextColor={DamageTypeColor[passive.dmgType]}
        />
        <Dropdown 
            label="DmgType"
            options={dmgTypeOptions}
            selectedOpt={passive.dmgType}
            update={updateDmgType}
        />
        <div className="class-passive-flex-row">
            <small>Effects:</small>
            <button onClick={() => addEffect()}>+</button>
        </div>
        {passive.effects.map((e, i) => passiveEffect(e, i))}
    </div>
  )
}
