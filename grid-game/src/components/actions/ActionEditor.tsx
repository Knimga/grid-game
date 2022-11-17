import './actionEditor.css';

import { useState } from 'react';

import { FaSave } from "react-icons/fa";

import NameInput from '../shared/NameInput';
import Dropdown from '../shared/Dropdown';
import NumStepper from '../shared/NumStepper';
import ClickSwitch from '../shared/ClickSwitch';
import EffectEditor from './EffectEditor';

import { makeInputOptions } from '../../services/detailStrings';
import { blankEffect } from '../../services/actions';

import { Action, Intent, DamageType, TargetingType, Effect, DamageTypeDarkColor } from '../../types';
import {InputOption} from '../../uiTypes';

interface ActionEditorInput {
    action: Action,
    update: Function,
    save: Function
}

export default function ActionEditor({action, update, save}: ActionEditorInput) {
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);

    const minRange: number = [TargetingType.self,TargetingType.burst].includes(action.target) ? 0 : 1;
    const maxRange: number = (action.isWeapon && action.dmgType !== DamageType.ranged) ? 2 : 10;
    const minMpCost: number = action.isWeapon ? 0 : 1;

    const dmgTypeOptions: InputOption[] = makeInputOptions(Object.values(DamageType));
    const offDefOptions: InputOption[] = makeInputOptions(Object.keys(Intent));
    const isWeaponOptions: InputOption[] = makeInputOptions(['weapon','ability']);

    const targetingTypeOptions: InputOption[] = makeInputOptions(
        Object.values(TargetingType).filter(type => {
            return action.isWeapon ? type === TargetingType.single : true
        })
    );

    function updateAction(newAction: Action): void {
        setUpdatesSaved(false); update(newAction);
    }

    function saveAction(): void {
        setUpdatesSaved(true); save(action);
    }

    function updateName(newName: string): void {
        if(newName !== action.name) updateAction({...action, name: newName})
    }

    function updateDmgType(newDmgType: DamageType): void {
        if(newDmgType !== action.dmgType) updateAction({...action, dmgType: newDmgType});
    }

    function updateIsWeapon(weaponOrAbility: string): void {
        if(!action.isWeapon) {
            action.intent = Intent.offense;
            action.target = TargetingType.single;
            action.mpCost = 0;
        } else {action.mpCost = 1}
        updateAction({...action, isWeapon: !action.isWeapon})
    }

    function updateOffDef(newIntent: Intent): void {
        if(!action.isWeapon) {
            updateAction({...action, intent: newIntent});
        }
    }

    function updateRange(newRange: number): void {
        if(!action.isWeapon || action.target !== TargetingType.self) {
            updateAction({...action, range: newRange})
        }
    }

    function updateMpCost(newMpCost: number): void {
        if(!action.isWeapon) updateAction({...action, mpCost: newMpCost})
    }

    function updateBurstRadius(newBurstRadius: number): void {
        updateAction({...action, burstRadius: newBurstRadius})
    }

    function updateTarget(newTarget: TargetingType): void {
        action.target = newTarget;
        if(newTarget !== TargetingType.burst && action.burstRadius) delete action.burstRadius;

        switch(newTarget) {
            case TargetingType.single: if(action.range === 0) action.range = 1; break;
            case TargetingType.burst: if(!action.burstRadius) action.burstRadius = 1; break;
            case TargetingType.line: if(action.range < 2) action.range = 2; break;
            case TargetingType.self: action.range = 0; break;
            default: break;
        }
        updateAction({...action});
    }

    function updateEffect(newEffect: Effect, effectIndex: number): void {
        action.effects[effectIndex] = newEffect; updateAction({...action});
    }

    function newEffect(): void {
        action.effects.push(blankEffect()); updateAction({...action});
    }

    function deleteEffect(index: number): void {
        if(action.effects.length > 1) {action.effects.splice(index, 1); updateAction({...action});}
    }

  return (
    <div className="action-editor-container">
        <FaSave 
            className={`action-save-button ${!updatesSaved ? 'not-saved' : ''}`} 
            onClick={() => saveAction()}
        />
        <div className="container-padding">
            <NameInput name={action.name} update={updateName} />
            <Dropdown 
                label="Damage Type"
                selectedOpt={action.dmgType}
                options={dmgTypeOptions} 
                update={updateDmgType} 
            />
            <ClickSwitch 
                label="Type"
                currentValue={action.isWeapon ? 'weapon' : 'ability'}
                options={isWeaponOptions}
                update={updateIsWeapon}
            />           
            <ClickSwitch
                label={'Intent'}
                currentValue={action.intent}
                options={offDefOptions}
                update={updateOffDef}
            />
            <div className="action-field-row">
                <Dropdown 
                    label="Target"
                    selectedOpt={action.target}
                    options={targetingTypeOptions} 
                    update={updateTarget} 
                />            
            </div>        
            <div className="action-field-row">
                <small className="action-field-label">Range:</small>
                <div className="action-field-value">
                    <NumStepper number={action.range} min={minRange} max={maxRange} update={updateRange} />
                </div>
            </div>
            <div className="action-field-row">
                <small className="action-field-label">MP Cost:</small>
                <div className="action-field-value">
                    <NumStepper number={action.mpCost} min={minMpCost} max={30} update={updateMpCost} />
                </div>
            </div>
            
            {
                action.target === TargetingType.burst && action.burstRadius ?  
                    <div className="action-field-row">
                        <small className="action-field-label">Burst Radius:</small>
                        <div className="action-field-value">
                            <NumStepper number={action.burstRadius} min={1} max={5} update={updateBurstRadius} />
                        </div>
                    </div>
                : ''
            }
            <div className="effect-editor-container">
                <div className="effect-editor-header">
                    <strong>Effects:</strong>
                    <button onClick={() => newEffect()}>+</button>
                </div>
                <div className="effect-editor-list">
                    {
                        action.effects.map((effect, index) =>
                            <EffectEditor 
                                effect={effect}
                                index={index}
                                key={Math.random()}
                                currentActionIntent={action.intent}
                                backgroundColor={DamageTypeDarkColor[effect.dmgType]}
                                update={updateEffect}
                                remove={deleteEffect}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    </div>
  )
}
