import './classBuilder.css';

import { useState } from 'react';

import { FaSave } from "react-icons/fa";

import ClassItemsList from './ClassItemsList';
import NameInput from '../shared/NameInput';
import ClickSwitch from '../shared/ClickSwitch';
import NumStepper from '../shared/NumStepper';
import AttrFocusSelector from './AttrFocusSelector';
import PassiveEffectPane from './PassiveEffectPane';

import { Class, Attributes, AttributeFocus, Action, Armor, PassiveEffect } from '../../types/types';
import { ClassRole, AttributeEnum, ItemListType, DamageType, EffectTargetStat } from '../../types/enums';
import { InputOption } from '../../types/uiTypes';

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
    const [selectedItemListType, setSelectedItemListType] = useState<ItemListType>(ItemListType.allWeapons);
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

    function removePassiveEffect(index: number): void {
        charClass.passives.splice(index, 1);
        updateClass({...charClass});
    }

    function pbTotal(attrObj: Attributes): number {
        let total: number = 0;
        for (let i = 0; i < attributes.length; i++) total += attrObj[attributes[i]];
        return total;
    }

    const itemFunctions = {
        removeAction: removeAction,
        removeArmor: removeArmor,
        addAction: addAction,
        addArmor: addArmor
    }

    const passives: PassiveEffect[] = [
        {
            name: "Eagle Eye",
            dmgType: DamageType.ranged,
            effects:[{targetStat: EffectTargetStat.rangedAtk, amount: 1}]
        }
    ]

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
        <div className="class-builder-passives-row">
            <span>Passives:</span>
            {passives.map((p, index) => 
                <PassiveEffectPane 
                    passive={p} 
                    index={index} 
                    removePassiveEffect={removePassiveEffect}
                />
            )}
        </div>
        <div className="class-builder-actions-armors">
            <div className="class-builder-column">
                <ClassItemsList
                    itemType={ItemListType.weapons}
                    actions={charClass.actions}
                    armors={[]}
                    itemFunctions={itemFunctions}
                />
                <ClassItemsList
                    itemType={ItemListType.abilities}
                    actions={charClass.actions}
                    armors={[]}
                    itemFunctions={itemFunctions}
                />
                <ClassItemsList
                    itemType={ItemListType.armor}
                    actions={[]}
                    armors={charClass.armor}
                    itemFunctions={itemFunctions}
                />
            </div>
            <div className="class-builder-column">
                <div className="class-item-sort-button-row">
                    <button onClick={() => setSelectedItemListType(ItemListType.allWeapons)}>Weapons</button>
                    <button onClick={() => setSelectedItemListType(ItemListType.allAbilities)}>Abilities</button>
                    <button onClick={() => setSelectedItemListType(ItemListType.allArmors)}>Armor</button>
                    <button>Passives</button>
                </div>
                <ClassItemsList 
                    itemType={selectedItemListType}
                    actions={actions}
                    armors={armors}
                    itemFunctions={itemFunctions}
                />
            </div>
        </div>
    </div>
  )
}
