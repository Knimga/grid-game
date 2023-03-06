import './weaponEditor.css';

import NameInput from '../shared/NameInput';
import ClickSwitch from '../shared/ClickSwitch';
import NumStepper from '../shared/NumStepper';
import ActionPane from '../shared/panes/ActionPane';

import { FaTrashAlt, FaSave } from "react-icons/fa";

import { makeInputOptions, randId, passiveEffectString, attrReqString } from '../../services/detailStrings';
import { blankAction } from '../../services/actions';
import { blankPassive, blankAttrReq } from '../../services/items';

import { Weapon } from '../../types/types';
import { DamageTypeColor, WeaponType } from '../../types/enums';
import { InputOption } from '../../types/uiTypes';

interface WeaponEditorInput {
    weapon: Weapon;
    updatesSaved: boolean;
    update: Function;
    save: Function;
    clickItem: Function;
}

export default function WeaponEditor({weapon, updatesSaved, update, save, clickItem}: WeaponEditorInput) {
    const weaponTypeOptions: InputOption[] = makeInputOptions(Object.keys(WeaponType));
    const isStartingWeaponOptions: InputOption[] = makeInputOptions(['yes', 'no']);

    function updateName(newName: string): void {
        weapon.name = newName;
        weapon.action.name = newName;
        update({...weapon});}

    function updateType(newType: WeaponType): void {weapon.type = newType; update({...weapon});}

    function updateHands(newHands: number): void {
        weapon.hands = newHands;
        weapon.action.hands = newHands;
        update({...weapon});}

    function updateIsStartingWeapon(yesOrNo: string): void {
        weapon.isStartingWeapon = yesOrNo === 'yes' ? true : false; 
        update({...weapon});
    }

    function addOtherAction(): void {
        weapon.otherActions.push(blankAction()); 
        update({...weapon});
    }

    function removeOtherAction(index: number): void {
        weapon.otherActions.splice(index, 1); 
        update({...weapon}, true);
    }

    function addPassive(): void {
        weapon.passives.push(blankPassive()); 
        update({...weapon});
    }

    function removePassive(index: number): void {
        weapon.passives.splice(index, 1); 
        update({...weapon}, true);
    }

    function addAttrReq(): void {
        weapon.attrReqs.push(blankAttrReq()); 
        update({...weapon});
    }

    function removeAttrReq(index: number): void {
        weapon.attrReqs.splice(index, 1); 
        update({...weapon}, true);
    }


  return (
    <div className="weapon-editor-pane">
        <FaSave 
            className={`save-icon ${updatesSaved ? '' : 'not-saved'}`} 
            onClick={() => save(weapon)}
        />
        <NameInput 
            name={weapon.name} 
            label="Weapon Name" 
            nameTextColor={DamageTypeColor[weapon.action.dmgType]} 
            update={updateName} 
        />
        <div className="click-switch-column">
            <ClickSwitch 
                label="Type"
                currentValue={weapon.type}
                options={weaponTypeOptions}
                update={updateType}
                centerAlignLabel={true}
            />
            <div className="numstepper-row">
                <div><small>Hands:</small></div>
                <div>
                    <NumStepper 
                        number={weapon.hands}
                        min={1} max={2}
                        update={updateHands}
                    />
                </div>
            </div>
            <ClickSwitch 
                label="Starting weapon?"
                currentValue={weapon.isStartingWeapon ? 'yes' : 'no'}
                options={isStartingWeaponOptions}
                update={updateIsStartingWeapon}
                centerAlignLabel={true}
            />
        </div>
        <div className="pane-row">
            <div className="pane-row-label">Action:</div>
            <div className="pane-row-panes">
                <ActionPane 
                    action={weapon.action} 
                    stats={null} 
                    onClick={() => clickItem('mainAction')}
                    index={0}//need this here so that onClick works...
                />
            </div>
        </div>
        <div className="pane-row">
            <div className="pane-row-label">
                <span>Other actions</span>
                <button onClick={() => addOtherAction()}>+</button>
            </div>
            <div className="pane-row-panes">
                {weapon.otherActions.map((action, index) => 
                    <div className="flex-row" key={randId()}>
                        <ActionPane 
                            action={action} 
                            stats={null} 
                            onClick={() => clickItem('otherActions', index)}
                            index={index}
                        />
                        <FaTrashAlt className="trash-icon" onClick={() => removeOtherAction(index)} />
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
                {weapon.passives.map((passive, index) => 
                    <div className="flex-row" key={randId()}>
                        <div className="mini-pane" onClick={() => clickItem('passives', index)}>
                            <small>{passiveEffectString(passive)}</small>
                            <FaTrashAlt className="trash-icon" onClick={() => removePassive(index)} />
                        </div>
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
                {weapon.attrReqs.map((req, index) => 
                    <div className="flex-row" key={randId()}>
                        <div className="mini-pane" onClick={() => clickItem('attrReqs', index)}>
                            <small>{attrReqString(req)}</small>
                            <FaTrashAlt className="trash-icon" onClick={() => removeAttrReq(index)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}
