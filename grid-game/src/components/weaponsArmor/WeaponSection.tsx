import './weaponsArmorTab.css';

import { useState } from "react";

import WeaponEditor from './WeaponEditor';
import WeaponPane from '../shared/panes/WeaponPane';
import ActionEditor from '../actions/ActionEditor';
import PassiveEditor from './PassiveEditor';
import AttrReqEditor from './AttrReqEditor';

import urls from '../../urls';
import { blankWeapon } from '../../services/items';

import { Weapon, Action, PassiveEffect, AttributeReq } from '../../types/types';

interface WeaponSectionInput {
    weapons: Weapon[];
    setWeapons: Function;
}

enum EditModes {
    mainAction = 'mainAction',
    otherActions = 'otherActions',
    passives = 'passives',
    attrReqs = 'attrReqs'
}

export default function WeaponSection({weapons, setWeapons}: WeaponSectionInput) {
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);
    const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(weapons[0]);
    const [editMode, setEditMode] = useState<EditModes | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    async function save<Weapon>(obj: Weapon): Promise<Weapon> {
        return fetch(urls.localRoot+urls.weapons.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Weapon})
    }

    async function saveWeapon(weapon: Weapon) {
        if(!selectedWeapon) {console.log('no selectedWeapon!'); return;}
       
        const newWeapon = await save(weapon);
        const newWeapons: Weapon[] = [...weapons];
        const weaponIndex = weapons.indexOf(selectedWeapon);

        if(!newWeapon) {console.log('no weapon returned from save operation!'); return;}
        
        if(weaponIndex === -1) {
            newWeapons.push(newWeapon)
        } else {newWeapons[weaponIndex] = newWeapon}

        setWeapons(newWeapons);
        setSelectedWeapon(newWeapon);
        setUpdatesSaved(true);
    }

    function updateWeapon(newWeapon: Weapon, removedArrayItem?: boolean): void {
        if(!selectedWeapon) {console.log('no selectedWeapon!'); return;}
        weapons[weapons.indexOf(selectedWeapon)] = newWeapon;

        if(removedArrayItem) {
            setEditMode(null);
            setEditIndex(null);
        }

        setWeapons(weapons);
        setSelectedWeapon(newWeapon);
        setUpdatesSaved(false);
    }

    function newWeapon(): void {
        setEditMode(null);
        setEditIndex(null);
        setSelectedWeapon(blankWeapon());
    }

    function selectWeapon(weap: Weapon): void {
        setEditMode(null);
        setEditIndex(null);
        setSelectedWeapon(weap);
    }

    function updateMainAction(action: Action): void {
        if(action.name !== selectedWeapon.name) selectedWeapon.name = action.name;
        selectedWeapon.action = {...action, isWeapon: true};
        updateWeapon({...selectedWeapon});
    }

    function updateOtherAction(action: Action): void {
        if(editIndex === null) {console.log('null editIndex!'); return;}
        selectedWeapon.otherActions[editIndex] = action;
        updateWeapon({...selectedWeapon});
    }

    function updatePassive(passive: PassiveEffect): void {
        if(editIndex === null) {console.log('null editIndex!'); return;}
        selectedWeapon.passives[editIndex] = passive;
        updateWeapon({...selectedWeapon});
    }

    function updateAttrReq(attrReq: AttributeReq): void {
        if(editIndex === null) {console.log('null editIndex!'); return;}
        selectedWeapon.attrReqs[editIndex] = attrReq;
        updateWeapon({...selectedWeapon});
    }

    function actionEditor(action: Action, update: Function): JSX.Element {
        return <ActionEditor action={action} update={update} />
    }

    function passiveEditor(passiveEffect: PassiveEffect, update: Function): JSX.Element {
        return <PassiveEditor passiveEffect={passiveEffect} update={update} />
    }

    function attrReqEditor(attrReq: AttributeReq, update: Function): JSX.Element {
        return <AttrReqEditor attrReq={attrReq} update={update} />
    }

    function secondaryEditor(): JSX.Element {
        const weap: Weapon = selectedWeapon;

        if(!editMode) return <></>;
        if(editMode === EditModes.mainAction) return actionEditor(weap.action, updateMainAction);
        if(editIndex === null) return <></>;

        switch(editMode) {
            case EditModes.otherActions: return actionEditor(weap.otherActions[editIndex], updateOtherAction);
            case EditModes.passives: return passiveEditor(weap.passives[editIndex], updatePassive);
            case EditModes.attrReqs: return attrReqEditor(weap.attrReqs[editIndex], updateAttrReq);
            default: return <></>
        }
    }

    function clickItem(newEditMode: EditModes, index?: number): void {
        if(index !== undefined) setEditIndex(index);
        setEditMode(newEditMode);
    }

  return (
    <div className="column-half">
        <div className="half-header-row">
            <strong>Weapons</strong>
        </div>
        <div className="weapons-armor-body">
            <div className="weapons-armor-list">
                <div className="sort-buttons-row">
                    <button>Sort 1</button>
                    <button>Sort 2</button>
                    <button onClick={() => newWeapon()}>+ New Weapon</button>
                </div>
                {weapons.map(w => 
                    <WeaponPane 
                        weapon={w}
                        stats={null}
                        isSelected={selectedWeapon._id === w._id}
                        onClick={selectWeapon}
                        key={w._id}
                    />
                )}
            </div>
            <div className="editor-column">
                <div className="main-editor-container">
                    {selectedWeapon ? 
                        <WeaponEditor 
                            weapon={selectedWeapon}
                            updatesSaved={updatesSaved}
                            update={updateWeapon} 
                            save={saveWeapon} 
                            clickItem={clickItem}
                        /> 
                    : ''}
                </div>
                <div className="secondary-editor-container">
                    {secondaryEditor()}
                </div>
            </div>
        </div>
    </div>
  )
}
