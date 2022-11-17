import './classBuilder.css';

import { useState } from 'react';

import { FaSave, FaArrowCircleRight, FaArrowCircleLeft } from "react-icons/fa";

import NameInput from '../shared/NameInput';
import ClickSwitch from '../shared/ClickSwitch';
import NumStepper from '../shared/NumStepper';
import AttrFocusSelector from './AttrFocusSelector';
import ActionPane from '../shared/ActionPane';
import ArmorPane from '../shared/ArmorPane';

import { Class, ClassRole, Attributes, AttributeFocus, AttributeEnum, Action, Armor } from '../../types';
import { InputOption } from '../../uiTypes';

import {makeInputOptions, cap} from '../../services/detailStrings';

interface ClassBuilderInput {
    charClass: Class,
    actions: Action[],
    armors: Armor[],
    update: Function,
    save: Function
}

export default function ClassBuilder({charClass, actions, armors, update, save}: ClassBuilderInput) {
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);
    const classRoleOptions: InputOption[] = makeInputOptions(Object.keys(ClassRole));
    const attributes: AttributeEnum[] = Object.values(AttributeEnum);

    function updateClass(newClass: Class): void {update(newClass); setUpdatesSaved(false);}

    function saveClass(): void {save(charClass); setUpdatesSaved(true);}

    function updateName(newName: string): void {updateClass({...charClass, name: newName})}

    function updateRole(newRole: ClassRole): void {updateClass({...charClass, role: newRole})}

    function updateAttrFocus(newFocus: AttributeFocus): void {
        updateClass({...charClass, attributeFocus: newFocus})
    }

    function updateAttr(attr: AttributeEnum, newValue: number): void {
        const attrObj: Attributes = {...charClass.attributes, [attr]: newValue};
        if(pbTotal(attrObj) <= 4) updateClass({...charClass, attributes: attrObj});
    }

    function removeAction(actionId: string): void {
        const targetAction: Action | undefined = charClass.actions.find(action => action._id === actionId);
        if(targetAction) {
            const targetIndex: number = charClass.actions.indexOf(targetAction);
            charClass.actions.splice(targetIndex, 1);
            updateClass({...charClass});
        }
    }

    function addAction(action: Action): void {
        if(!charClass.actions.map(a => a._id).includes(action._id)) {
            charClass.actions.push(action); updateClass({...charClass})
        }
    }

    function removeArmor(armorId: string): void {
        const targetArmor: Armor | undefined = charClass.armor.find(armor => armor._id === armorId);
        if(targetArmor) {
            const targetIndex: number = charClass.armor.indexOf(targetArmor);
            charClass.armor.splice(targetIndex, 1);
            updateClass({...charClass});
        }
    }

    function addArmor(armor: Armor): void {
        if(!charClass.armor.map(a => a._id).includes(armor._id)) {
            charClass.armor.push(armor); updateClass({...charClass})
        }
    }

    function pbTotal(attrObj: Attributes): number {
        let total: number = 0;
        for (let i = 0; i < attributes.length; i++) total += attrObj[attributes[i]];
        return total;
    }

    function sortedActions(): Action[] {return actions.sort((a,b) => a.name > b.name ? 1 : -1)}

  return (
    <div className="class-builder-container">
        <div className="class-builder-main-edit">
            <div className="class-builder-column">
                <FaSave 
                    className={`class-builder-save-button ${updatesSaved ? '' : 'not-saved'}`}
                    onClick={() => saveClass()}
                />
                <NameInput name={charClass.name} update={updateName} />
                <ClickSwitch 
                    label="Role" 
                    currentValue={charClass.role} 
                    options={classRoleOptions}
                    update={updateRole}
                />
                <AttrFocusSelector currentFoci={charClass.attributeFocus} update={updateAttrFocus} />
            </div>
            <div className="class-builder-column">
                <div className="class-builder-attr-column">
                    {attributes.map(attr => {
                        return <div className="class-builder-attr-row" key={Math.random()}>
                            <div className="class-builder-attr-label">
                                <small>{cap(attr) + ":"}</small>
                            </div>
                            <NumStepper 
                                number={charClass.attributes[attr]}
                                min={0} max={4}
                                attr={attr}
                                update={updateAttr}
                            />
                        </div>
                    })}
                    <small>{`Point Buy: ${pbTotal(charClass.attributes)}/4`}</small>
                </div>                
            </div>
        </div>
        <div className="class-builder-actions-armors">
            <div className="class-builder-column">
                <div className="class-builder-actions">
                    <div className="class-builder-list weapons-list">
                        <div className="class-builder-list-header"><strong>Weapons</strong></div>
                        <div className="class-builder-list-box">
                            {charClass.actions.filter(action => action.isWeapon).map(action => {
                                return <div className="class-builder-list-box-row" key={Math.random()}>
                                    <ActionPane action={action} stats={null} />
                                    <FaArrowCircleRight 
                                        className="arrow-icons" 
                                        onClick={() => removeAction(action._id)} 
                                    />
                                </div>
                            })}
                        </div>
                    </div>
                    <div className="class-builder-list abilities-list">
                        <div className="class-builder-list-header"><strong>Abilities</strong></div>
                        <div className="class-builder-list-box">
                            {charClass.actions.filter(action => !action.isWeapon).map(action => {
                                return <div className="class-builder-list-box-row" key={Math.random()}>
                                    <ActionPane action={action} stats={null} />
                                    <FaArrowCircleRight 
                                        className="arrow-icons"
                                        onClick={() => removeAction(action._id)}
                                    />
                            </div>
                            })}
                        </div>
                    </div>
                </div>
                <div className="class-builder-armor">
                    <div className="class-builder-list armor-list">
                        <div className="class-builder-list-header"><strong>Armor</strong></div>
                        <div className="class-builder-list-box">
                            {charClass.armor.map(armor => 
                                <div className="class-builder-list-box-row" key={Math.random()}>
                                    <ArmorPane armor={armor} />
                                    <FaArrowCircleRight 
                                        className="arrow-icons"
                                        onClick={() => removeArmor(armor._id)} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="class-builder-column">
                <div className="class-builder-actions">
                    <div className="class-builder-list action-list">
                        <div className="class-builder-list-header"><strong>Actions List</strong></div>
                        <div className="class-builder-list-box">
                            {sortedActions().map(action => 
                                <div className="class-builder-list-box-row" key={Math.random()}>
                                    <FaArrowCircleLeft 
                                        className="arrow-icons"
                                        onClick={() => addAction(action)}
                                    />
                                    <ActionPane action={action} stats={null} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="class-builder-armor">
                    <div className="class-builder-list armor-list">
                        <div className="class-builder-list-header"><strong>Armor List</strong></div>
                        <div className="class-builder-list-box">
                            {armors.map(armor => 
                                <div className="class-builder-list-box-row" key={Math.random()}>
                                    <FaArrowCircleLeft 
                                        className="arrow-icons"
                                        onClick={() => addArmor(armor)}
                                        key={Math.random()}
                                    />
                                    <ArmorPane armor={armor} key={Math.random()} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
