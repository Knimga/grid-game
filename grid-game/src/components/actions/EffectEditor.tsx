import './effectEditor.css';

import { Effect } from '../../types/types';
import { EffectType, DamageType, Intent, EffectTargetStat, DamageTypeDarkColor } from '../../types/enums';
import {InputOption} from '../../types/uiTypes';

import { FaTrashAlt } from "react-icons/fa";

import Dropdown from '../shared/Dropdown';
import NumStepper from '../shared/NumStepper';
import ClickSwitch from '../shared/ClickSwitch';

import {makeInputOptions} from '../../services/detailStrings';

interface EffectEditorInput {
    effect: Effect,
    index: number,
    currentActionIntent: Intent,
    backgroundColor: DamageTypeDarkColor,
    update: Function,
    remove: Function
}

export default function EffectEditor(
    {effect, index, currentActionIntent, backgroundColor, update, remove}: EffectEditorInput
) {
    const hasDuration: boolean = ['buff','debuff','hot','dot'].includes(effect.type);
    const isOverTime: boolean = ['hot','dot'].includes(effect.type);
    const durationMin: number = hasDuration ? 1 : 0;
    const durationMax: number = hasDuration ? 5 : 0;
    const flatAmountMin: number = minimumFlatAmount();
    const offensiveEffectTypes: EffectType[] = [EffectType.damage, EffectType.debuff, EffectType.dot];
    const defensiveEffectTypes: EffectType[] = [EffectType.healing, EffectType.buff, EffectType.hot, EffectType.threat];

    const allowedTargetStats: string[] = ['buff','debuff'].includes(effect.type) ? 
        Object.keys(EffectTargetStat).filter(str => !['hp','mp'].includes(str)) : ['hp','mp'];
    
    const effectTypeOptions: InputOption[] = makeInputOptions([...offensiveEffectTypes, ...defensiveEffectTypes]);
    const dmgTypeOptions: InputOption[] = makeInputOptions(Object.keys(DamageType));
    const targetStatOptions: InputOption[] = makeInputOptions(allowedTargetStats);
    const affectsOptions: InputOption[] = makeInputOptions(['target', 'self']);
    const effectDmgOptions: InputOption[] = makeInputOptions(['roll','flatAmount']);
    const dieTypeOptions: InputOption[] = makeInputOptions(['4','6','8','10','12','20']);

    function minimumFlatAmount(): number {
        if(isOverTime) return effect.duration;
        if(effect.type === 'threat') return -20;
        return 0;
    }

    function updateEffectType(newType: EffectType): void {
        if([EffectType.damage,EffectType.healing].includes(newType)) effect.duration = 0;
        if([EffectType.dot,EffectType.hot].includes(newType)) {
            if(effect.duration > 1) effect.duration = 1;
            if(effect.flatAmount && effect.flatAmount < effect.duration) {effect.flatAmount = effect.duration}
        }
        update({...effect, type: newType}, index);
    }

    function updateDamageType(newType: DamageType): void {update({...effect, dmgType: newType}, index)}

    function updateTargetStat(newTargetStat: EffectTargetStat): void {
        update({...effect, targetStat: newTargetStat}, index)
    }

    function updateTargetSelf(newAffectsValue: string): void {
        update({...effect, targetsSelf: newAffectsValue === 'self'}, index)
    }

    function updateDuration(newDuration: number): void {
        if(hasDuration) {
            if(isOverTime && effect.flatAmount) {
                if(effect.flatAmount < newDuration) effect.flatAmount = newDuration
            }
            update({...effect, duration: newDuration}, index)
        }
    }

    function updateDmgFormat(newFormat: string): void {
        switch(newFormat) {
            case 'roll': effect.roll = {numDie: 1, dieSides: 4, mod: 0};
                if(effect.flatAmount) delete effect.flatAmount; break;
            case 'flatAmount': effect.flatAmount = 1;
                if(effect.roll) delete effect.roll; break;
            default: break;
        }
        update({...effect}, index);
    }

    function updateNumDie(newNumDie: string): void {
        if(effect.roll) {effect.roll.numDie = Number(newNumDie); update({...effect}, index)}
    }

    function updateDieType(newDieType: string): void {
        if(effect.roll) {effect.roll.dieSides = Number(newDieType); update({...effect}, index)}
    }

    function updateMod(newMod: string): void {
        if(effect.roll) {effect.roll.mod = Number(newMod); update({...effect}, index)}
    }

    function updateFlatAmount(newAmount: number): void {
        if(effect.flatAmount !== undefined) {effect.flatAmount = newAmount; update({...effect}, index)}
    }

    function rollEditor(): JSX.Element {
        if(effect.roll) {
            return <div className="roll-editor-container">
                <div className="effect-editor-field-row">
                    <div className="effect-editor-field-label">
                        <small># of Die:</small>
                    </div>
                    <div className="effect-editor-field-value">
                        <NumStepper number={effect.roll.numDie} min={1} max={10} update={updateNumDie} />
                    </div>
                </div>
                <Dropdown 
                    label="Die Type"
                    selectedOpt={effect.roll.dieSides.toString()}
                    options={dieTypeOptions}
                    update={updateDieType}
                />
                <div className="effect-editor-field-row">
                    <div className="effect-editor-field-label">
                        <small>Mod:</small>
                    </div>
                    <div className="effect-editor-field-value">
                        <NumStepper number={effect.roll.mod} min={0} max={20} update={updateMod} />
                    </div>
                </div>
            </div>
        } else {return <></>}
    }

  return (
    <div className="effect-edit-pane" style={{backgroundColor: backgroundColor}}>
        <FaTrashAlt className="delete-effect-button" onClick={() => remove(index)} />
        <Dropdown
            label="Effect Type"
            selectedOpt={effect.type}
            options={effectTypeOptions} 
            update={updateEffectType} 
        />
        <Dropdown
            label="Damage Type"
            selectedOpt={effect.dmgType}
            options={dmgTypeOptions} 
            update={updateDamageType} 
        />
        <Dropdown 
            label="Target Stat"
            selectedOpt={effect.targetStat}
            options={targetStatOptions}
            update={updateTargetStat}
        />
        <ClickSwitch 
            label="Affects"
            currentValue={effect.targetsSelf ? 'self' : 'target'}
            options={affectsOptions}
            update={updateTargetSelf}
        />
        <div className="effect-editor-field-row">
            <div className="effect-editor-field-label">
                <small>Duration:</small>
            </div>
            <div className="effect-editor-field-value">
                <NumStepper 
                    number={effect.duration} 
                    min={durationMin} 
                    max={durationMax} 
                    update={updateDuration} 
                />
            </div>
        </div>
        <div className="effect-dmg-editor">
            <ClickSwitch
                label="Damage"
                currentValue={effect.roll ? 'roll' : 'flatAmount'}
                options={effectDmgOptions}
                update={updateDmgFormat}
            />
            {effect.roll ? rollEditor() : ''}
            {effect.flatAmount !== undefined ? 
                <div className="effect-editor-field-row">
                    <div className="effect-editor-field-label">
                        <small>Flat Amount:</small>
                    </div>
                    <div className="effect-editor-field-value">
                        <NumStepper 
                            number={effect.flatAmount} 
                            min={flatAmountMin} 
                            max={20} 
                            update={updateFlatAmount} 
                        />
                    </div>
                </div> 
            : ''}
        </div>
    </div>
  )
}
