import './weaponEditor.css';

import NameInput from '../shared/NameInput';
import ClickSwitch from '../shared/ClickSwitch';
import NumStepper from '../shared/NumStepper';
import ActionPane from '../shared/panes/ActionPane';

import { FaTrashAlt, FaSave } from "react-icons/fa";

import { makeInputOptions, randId, passiveEffectString, attrReqString } from '../../services/detailStrings';
import { blankAction } from '../../services/actions';
import { blankPassive, blankAttrReq } from '../../services/items';

import { Armor, AttributeReq, PassiveEffect } from '../../types/types';
import { ArmorType } from '../../types/enums';
import { InputOption } from '../../types/uiTypes';

interface ArmorEditorInput {
    armor: Armor;
    updatesSaved: boolean;
    update: Function;
    save: Function;
    clickItem: Function;
}

export default function ArmorEditor({armor, updatesSaved, update, save, clickItem}: ArmorEditorInput) {
    const armorTypeOptions: InputOption[] = makeInputOptions(Object.keys(ArmorType));
    const isStartingArmorOptions: InputOption[] = makeInputOptions(['yes', 'no']);

    function updateName(newName: string): void {armor.name = newName; update({...armor});}

    function updateType(newType: ArmorType): void {armor.type = newType; update({...armor});}

    function updateIsStartingArmor(yesOrNo: string): void {
        armor.isStartingArmor = yesOrNo === 'yes' ? true : false; 
        update({...armor});
    }

    function updateAC(newAC: number): void {
        armor.ac = newAC;
        update({...armor});
    }

    function updateMAC(newMAC: number): void {
        armor.mac = newMAC;
        update({...armor});
    }

    function addAction(): void {
        armor.actions.push(blankAction()); 
        update({...armor});
    }

    function removeAction(index: number): void {
        armor.actions.splice(index, 1); 
        update({...armor}, true);
    }

    function addPassive(): void {
        armor.passives.push(blankPassive()); 
        update({...armor});
    }

    function removePassive(index: number): void {
        armor.passives.splice(index, 1); 
        update({...armor}, true);
    }

    function addAttrReq(): void {
        armor.attrReqs.push(blankAttrReq()); 
        update({...armor});
    }

    function removeAttrReq(index: number): void {
        armor.attrReqs.splice(index, 1); 
        update({...armor}, true);
    }

    function passiveMiniPane(passive: PassiveEffect, index: number): JSX.Element {
        return <div className="mini-pane" onClick={() => clickItem('passives', index)}>
            <small>{passiveEffectString(passive)}</small>
            <FaTrashAlt className="trash-icon" onClick={() => removePassive(index)} />
        </div>
    }

    function attrReqsMiniPane(attrReq: AttributeReq, index: number): JSX.Element {
        return <div className="mini-pane" onClick={() => clickItem('attrReqs', index)}>
            <small>{attrReqString(attrReq)}</small>
            <FaTrashAlt className="trash-icon" onClick={() => removeAttrReq(index)} />
        </div>
    }


  return (
    <div className="weapon-editor-pane">
        <FaSave 
            className={`save-icon ${updatesSaved ? '' : 'not-saved'}`} 
            onClick={() => save(armor)}
        />
        <NameInput 
            name={armor.name} 
            label="Armor Name"
            update={updateName} 
        />
        <div className="click-switch-column">
            <ClickSwitch 
                label="Type"
                currentValue={armor.type}
                options={armorTypeOptions}
                update={updateType}
                centerAlignLabel={true}
            />
            
            <ClickSwitch 
                label="Starting armor?"
                currentValue={armor.isStartingArmor ? 'yes' : 'no'}
                options={isStartingArmorOptions}
                update={updateIsStartingArmor}
                centerAlignLabel={true}
            />
        </div>
        <div className="ac-mac-row">
            <div className="ac-mac-numstepper">
                <NumStepper 
                    number={armor.ac}
                    min={0} max={20}
                    update={updateAC}
                />
                <strong>AC</strong>
            </div>
            <div className="ac-mac-numstepper">
                <NumStepper 
                    number={armor.mac}
                    min={0} max={20}
                    update={updateMAC}
                />
                <strong>MAC</strong>
            </div>
        </div>
        <div className="pane-row">
            <div className="pane-row-label">
                <span>Actions</span>
                <button onClick={() => addAction()}>+</button>
            </div>
            <div className="pane-row-panes">
                {armor.actions.map((action, index) => 
                    <div className="flex-row" key={randId()}>
                        <ActionPane 
                            action={action} 
                            stats={null} 
                            onClick={() => clickItem('actions', index)}
                            index={index}
                        />
                        <FaTrashAlt className="trash-icon" onClick={() => removeAction(index)} />
                    </div>
                )}
            </div>
        </div>
        <div className="pane-row">
            <div className="pane-row-label">
                <span>Passives</span>
                <button onClick={() => addPassive()}>+</button>
            </div>
            <div className="pane-row-panes">
                {armor.passives.map((passive, index) => 
                    <div className="flex-row" key={randId()}>
                        {passiveMiniPane(passive, index)}
                    </div>
                )}
            </div>
        </div>
        <div className="pane-row">
            <div className="pane-row-label">
                <span>Attr. Req's</span>
                <button onClick={() => addAttrReq()}>+</button>
            </div>
            <div className="pane-row-panes">
                {armor.attrReqs.map((req, index) => 
                    <div className="flex-row" key={randId()}>
                        {attrReqsMiniPane(req, index)}
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}
