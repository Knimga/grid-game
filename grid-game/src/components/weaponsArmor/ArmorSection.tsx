import './weaponsArmorTab.css';

import { useState } from "react";

import ArmorEditor from './ArmorEditor';
import ArmorPane from '../shared/panes/ArmorPane';
import ActionEditor from '../actions/ActionEditor';
import PassiveEditor from './PassiveEditor';
import AttrReqEditor from './AttrReqEditor';
import Dropdown from '../shared/Dropdown';

import urls from '../../urls';
import { blankArmor } from '../../services/items';

import { Armor, Action, PassiveEffect, AttributeReq } from '../../types/types';
import { InputOption } from '../../types/uiTypes';
import { makeInputOptions } from '../../services/detailStrings';

interface WeaponSectionInput {
    armors: Armor[];
    setArmors: Function;
}

enum EditModes {
    actions = 'actions',
    passives = 'passives',
    attrReqs = 'attrReqs'
}

export default function ArmorSection({armors, setArmors}: WeaponSectionInput) {
    const [sortedArmors, setSortedArmors] = useState<Armor[]>(armors);
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);
    const [selectedArmor, setSelectedArmor] = useState<Armor>(armors[0]);
    const [editMode, setEditMode] = useState<EditModes | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    const filterOptions: InputOption[] = makeInputOptions(['all', 'armor', 'shields']);

    function setFilter(filter: string): void {
        setSelectedFilter(filter);
        switch(filter) {
            case 'all': setSortedArmors(armors.sort((a: Armor, b: Armor) => a.name > b.name ? 1 : -1)); break;
            case 'armor': setSortedArmors(armors.filter(a => a.type !== 'shield')); break;
            case 'shields': setSortedArmors(armors.filter(a => a.type === 'shield')); break;
            default: break;
        }
    }

    async function save<Armor>(obj: Armor): Promise<Armor> {
        return fetch(urls.localRoot+urls.armors.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Armor})
    }

    async function saveArmor(armor: Armor) {
        if(!selectedArmor) {console.log('no selectedArmor!'); return;}
       
        const newArmor = await save(armor);
        const newArmors: Armor[] = [...armors];
        const armorIndex = armors.indexOf(selectedArmor);

        if(!newArmor) {console.log('no armor returned from save operation!'); return;}
        
        if(armorIndex === -1) {
            newArmors.push(newArmor)
        } else {newArmors[armorIndex] = newArmor}

        setArmors(newArmors);
        setSelectedArmor(newArmor);
        setUpdatesSaved(true);
    }

    function updateArmor(newArmor: Armor, removedArrayItem?: boolean): void {
        if(!selectedArmor) {console.log('no selectedWeapon!'); return;}
        armors[armors.indexOf(selectedArmor)] = newArmor;

        if(removedArrayItem) {
            setEditMode(null);
            setEditIndex(null);
        }

        setArmors(armors)
        setSelectedArmor(newArmor);
        setUpdatesSaved(false);
    }

    function newArmor(): void {setSelectedArmor(blankArmor())}

    function selectArmor(armor: Armor): void {
        setEditMode(null);
        setEditIndex(null);
        setSelectedArmor(armor);
    }

    function updateAction(action: Action): void {
        if(editIndex === null) {console.log('null editIndex!'); return;}
        selectedArmor.actions[editIndex] = action;
        updateArmor({...selectedArmor});
    }

    function updatePassive(passive: PassiveEffect): void {
        if(editIndex === null) {console.log('null editIndex!'); return;}
        selectedArmor.passives[editIndex] = passive;
        updateArmor({...selectedArmor});
    }

    function updateAttrReq(attrReq: AttributeReq): void {
        if(editIndex === null) {console.log('null editIndex!'); return;}
        selectedArmor.attrReqs[editIndex] = attrReq;
        updateArmor({...selectedArmor});
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
        if(!editMode || editIndex === null) return <></>;

        switch(editMode) {
            case EditModes.actions: return actionEditor(selectedArmor.actions[editIndex], updateAction);
            case EditModes.passives: return passiveEditor(selectedArmor.passives[editIndex], updatePassive);
            case EditModes.attrReqs: return attrReqEditor(selectedArmor.attrReqs[editIndex], updateAttrReq);
            default: return <></>;
        }
    }

    function clickItem(newEditMode: EditModes, index: number): void {
        setEditIndex(index);
        setEditMode(newEditMode);
    }

  return (
    <div className="column-half">
        <div className="half-header-row">
            <strong>Armor</strong>
        </div>
        <div className="weapons-armor-body">
            <div className="weapons-armor-list">
                <div className="sort-buttons-row">
                    <Dropdown 
                        label=""
                        selectedOpt={selectedFilter}
                        options={filterOptions}
                        hideLabel={true}
                        update={setFilter}
                    />
                    <button onClick={() => newArmor()}>+ New Armor</button>
                </div>
                {sortedArmors.map(armor => 
                    <ArmorPane 
                        armor={armor}
                        isSelected={armor._id === selectedArmor._id}
                        key={armor._id}
                        onClick={() => selectArmor(armor)}
                    />
                )}
            </div>
            <div className="editor-column">
                <div className="main-editor-container">
                    {selectedArmor ? 
                        <ArmorEditor 
                            armor={selectedArmor}
                            updatesSaved={updatesSaved}
                            update={updateArmor} 
                            save={saveArmor} 
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
