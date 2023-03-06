import './classBuilder.css';

import { useState, useEffect } from 'react';

import { FaSave } from "react-icons/fa";

import ClassItemsList from './ClassItemsList';
import NameInput from '../shared/NameInput';
import ClickSwitch from '../shared/ClickSwitch';
import NumStepper from '../shared/NumStepper';
import MultiSelector from '../shared/MultiSelector';
import TextAreaInput from '../shared/TextAreaInput';
import TalentTierPane from '../shared/panes/TalentTierPane';

import { makeInputOptions, cap, randId } from '../../services/detailStrings';
import { baseClassAttrPointBuy } from '../../services/charCalc';
import urls from '../../urls';

import { 
    Class, Attributes, AttributeFocus, Action, Armor, Weapon, Passive, Talent
} from '../../types/types';
import { ClassRole, AttributeEnum, ItemListType, WeaponType, ArmorType } from '../../types/enums';
import { InputOption } from '../../types/uiTypes';



interface ClassBuilderInput {
    charClass: Class;
    actions: Action[];
    armors: Armor[];
    weapons: Weapon[];
    passives: Passive[];
    update: Function;
    save: Function;
}

export default function ClassBuilder({charClass, actions, armors, weapons, passives, update, save}: ClassBuilderInput) {
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);
    const [selectedItemListType, setSelectedItemListType] = useState<ItemListType | null>(null);
    const [talentTierEditIndex, setTalentTierEditIndex] = useState<number | null>(null);
    const [talents, setTalents] = useState<Talent[][]>([]);

    const classRoleOptions: InputOption[] = makeInputOptions(Object.keys(ClassRole));
    const availabilityOptions: InputOption[] = makeInputOptions(['yes', 'no']);
    const attributeFocusOptions: InputOption[] = makeInputOptions(Object.values(AttributeEnum));
    const weaponTypeOptions: InputOption[] = makeInputOptions(Object.keys(WeaponType));
    const armorTypeOptions: InputOption[] = makeInputOptions(Object.keys(ArmorType));
    const attributes: AttributeEnum[] = Object.values(AttributeEnum);

    useEffect(() => {
        if(!charClass._id) return;
        fetch(urls.localRoot+urls.classes.getTalentsByClassId(charClass._id))
            .then(res => res.json())
            .then((data) => setTalents(data))
            .catch((err) => console.log(err))
    },[charClass._id]);

    function updateClass(newClass: Class): void {update(newClass); setUpdatesSaved(false);}
    
    function saveClass(): void {save(charClass); setUpdatesSaved(true);}

    function updateName(newName: string): void {updateClass({...charClass, name: newName})}

    function updateRole(newRole: ClassRole): void {updateClass({...charClass, role: newRole})}

    function updateDesc(newDesc: string): void {updateClass({...charClass, desc: newDesc})}

    function updateAvailability(newAvailability: string): void {
        updateClass({...charClass, availableInGame: newAvailability === 'yes' ? true : false});
    }

    function updateAttrFocus(newFocus: AttributeFocus): void {
        updateClass({...charClass, attributeFocus: newFocus})
    }

    function updateAttr(attr: AttributeEnum, newValue: number): void {
        const attrObj: Attributes = {...charClass.attributes, [attr]: newValue};
        if(pbTotal(attrObj) <= baseClassAttrPointBuy) {
            updateClass({...charClass, attributes: attrObj})
        }
    }

    function updateWeaponProfs(newProfs: WeaponType[]): void {
        updateClass({...charClass, weaponProfs: newProfs})
    }

    function updateArmorProfs(newProfs: ArmorType[]): void {
        updateClass({...charClass, armorProfs: newProfs})
    }

    function addWeapon(weapon: Weapon): void {
        if(!charClass.startingWeapons.map(w => w._id).includes(weapon._id)) {
            charClass.startingWeapons.push(weapon); updateClass({...charClass});
        }
    }

    function removeWeapon(weaponId: string): void {
        const targetWeapon: Weapon | undefined = charClass.startingWeapons.find(
            weapon => weapon._id === weaponId);
        if(targetWeapon) {
            const targetIndex: number = charClass.startingWeapons.indexOf(targetWeapon);
            charClass.startingWeapons.splice(targetIndex, 1);
            updateClass({...charClass});
        }
    }

    function removeAction(actionId: string): void {
        const targetAction: Action | undefined = charClass.startingActions.find(action => action._id === actionId);
        if(targetAction) {
            const targetIndex: number = charClass.startingActions.indexOf(targetAction);
            charClass.startingActions.splice(targetIndex, 1);
            updateClass({...charClass});
        }
    }

    function addAction(action: Action): void {
        if(talentTierEditIndex !== null) {
            addActionTalent(action, talentTierEditIndex); return;
        }
        if(!charClass.startingActions.map(a => a._id).includes(action._id)) {
            charClass.startingActions.push(action); updateClass({...charClass})
        }
    }

    function removeArmor(armorId: string): void {
        const targetArmor: Armor | undefined = charClass.startingArmor.find(armor => armor._id === armorId);
        if(targetArmor) {
            const targetIndex: number = charClass.startingArmor.indexOf(targetArmor);
            charClass.startingArmor.splice(targetIndex, 1);
            updateClass({...charClass});
        }
    }

    function addArmor(armor: Armor): void {
        if(!charClass.startingArmor.map(a => a._id).includes(armor._id)) {
            charClass.startingArmor.push(armor); updateClass({...charClass})
        }
    }

    function addPassive(passive: Passive): void {
        if(talentTierEditIndex !== null) {
            addPassiveTalent(passive, talentTierEditIndex); return;
        }
        charClass.passives.push(passive);
        updateClass({...charClass});
    }

    function removePassive(index: number): void {
        charClass.passives.splice(index, 1);
        updateClass({...charClass});
    }

    function addActionTalent(talent: Action, tierIndex: number): void {
        if(talentAlreadyAdded(talent._id)) return;
        talents[tierIndex].push({passive: null, action: talent});
        charClass.talents[tierIndex].push({passive: null, action: talent});
        setTalents(talents);
        updateClass({...charClass});
    }

    function addPassiveTalent(talent: Passive, tierIndex: number): void {
        if(talentAlreadyAdded(talent._id)) return;
        talents[tierIndex].push({passive: talent, action: null});
        charClass.talents[tierIndex].push({passive: talent, action: null});
        setTalents(talents);
        updateClass({...charClass});
    }

    function removeTalent(tierIndex: number, talentIndex: number): void {
        talents[tierIndex].splice(talentIndex, 1);
        charClass.talents[tierIndex].splice(talentIndex, 1);
        setTalents(talents);
        updateClass({...charClass});
    }

    function selectEditTier(tierIndex: number): void {
        if(tierIndex === talentTierEditIndex) {
            setTalentTierEditIndex(null); return;
        }
        setTalentTierEditIndex(tierIndex);
    }

    function talentAlreadyAdded(talentId: string): boolean {
        return charClass.talents.some(tier => tier.some(
            talent => talent.passive?._id === talentId || talent.action?._id === talentId
        ))
    }

    function pbTotal(attrObj: Attributes): number {
        let total: number = 0;
        for (let i = 0; i < attributes.length; i++) total += attrObj[attributes[i]];
        return total;
    }

    function attrRow(attr: keyof Attributes): JSX.Element {
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
    }

    const itemFunctions = {
        removeAction: removeAction,
        removeArmor: removeArmor,
        removeWeapon: removeWeapon,
        removePassive: removePassive,
        addAction: addAction,
        addArmor: addArmor,
        addWeapon: addWeapon,
        addPassive: addPassive
    }

  return (
    <div className="class-builder-container">
        <div className="class-builder-editor">
            <div className="class-builder-main-edit">
                <div className="class-builder-column">
                    <FaSave 
                        className={`class-builder-save-button ${updatesSaved ? '' : 'not-saved'}`}
                        onClick={() => saveClass()}
                    />
                    <NameInput name={charClass.name} update={updateName} label="Class Name" />
                    <ClickSwitch 
                        label="Available in-game?"
                        currentValue={charClass.availableInGame ? 'yes' : 'no'}
                        options={availabilityOptions}
                        update={updateAvailability}
                    />
                    <ClickSwitch 
                        label="Role" 
                        currentValue={charClass.role} 
                        options={classRoleOptions}
                        update={updateRole}
                    />
                    <MultiSelector 
                        label="Attribute Focus"
                        options={attributeFocusOptions}
                        currentlySelected={charClass.attributeFocus}
                        maxSelections={2}
                        minSelections={2}
                        update={updateAttrFocus} 
                    />
                    <MultiSelector 
                        label="Weapon Proficiencies"
                        options={weaponTypeOptions}
                        currentlySelected={charClass.weaponProfs}
                        maxSelections={weaponTypeOptions.length}
                        minSelections={1}
                        update={updateWeaponProfs}
                    />
                    <MultiSelector 
                        label="Armor Proficiencies"
                        options={armorTypeOptions}
                        currentlySelected={charClass.armorProfs}
                        maxSelections={armorTypeOptions.length}
                        minSelections={1}
                        update={updateArmorProfs}
                    />    
                </div>
                <div className="class-builder-column">
                    <TextAreaInput textValue={charClass.desc} update={updateDesc} />
                    <div className="class-builder-attr-column">
                        {attributes.map(attr => attrRow(attr))}
                        <small>{`Point Buy: ${pbTotal(charClass.attributes)}/4`}</small>
                    </div>      
                </div>
            </div>
            <div className="class-builder-passives-row">
                <ClassItemsList 
                    itemType={ItemListType.passives}
                    actions={[]} weapons={[]} armors={[]}
                    passives={charClass.passives}
                    itemFunctions={itemFunctions}
                    onClick={() => setSelectedItemListType(ItemListType.allPassives)}
                    isRow={true}
                />
            </div>
            <div className="class-builder-actions-armors">
                <div className="class-builder-column">
                    <ClassItemsList 
                        itemType={ItemListType.weapons}
                        actions={[]} armors={[]} passives={[]}
                        weapons={charClass.startingWeapons}
                        itemFunctions={itemFunctions}
                        onClick={() => setSelectedItemListType(ItemListType.allWeapons)}
                    />
                    <ClassItemsList 
                        itemType={ItemListType.armor}
                        actions={[]} weapons={[]} passives={[]}
                        armors={charClass.startingArmor}
                        itemFunctions={itemFunctions}
                        onClick={() => setSelectedItemListType(ItemListType.allArmors)}
                    />
                </div>
                <div className="class-builder-column">
                    <ClassItemsList 
                        itemType={ItemListType.abilities}
                        actions={charClass.startingActions}
                        weapons={[]} armors={[]} passives={[]}
                        itemFunctions={itemFunctions}
                        onClick={() => setSelectedItemListType(ItemListType.allAbilities)}
                    />
                </div>
            </div>
            <div className="class-builder-talents">
                <strong>Talents</strong>
                {talents.map((talentTier, tierIndex) => 
                    <TalentTierPane
                        tierIndex={tierIndex}
                        talents={talentTier}
                        selectedTalentId={null}
                        selectTier={selectEditTier}
                        selectTalent={() => {}}
                        stats={null}
                        deleteTalent={removeTalent}
                        isSelected={tierIndex === talentTierEditIndex}
                        enableTalentList={setSelectedItemListType}
                        key={randId()}
                    />
                )}
            </div>
        </div>
        <div className="class-builder-pane-list">
            {selectedItemListType ? 
                <ClassItemsList 
                    itemType={selectedItemListType}
                    actions={actions}
                    weapons={weapons}
                    armors={armors}
                    passives={passives}
                    itemFunctions={itemFunctions}
                />
            : ''}
        </div>
    </div>
  )
}
