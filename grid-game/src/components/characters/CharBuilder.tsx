import {useState} from 'react';
import { FaSave } from "react-icons/fa";

import './charBuilder.css';

import NumStepper from '../shared/NumStepper';
import ClassPane from '../shared/ClassPane';
import NameInput from '../shared/NameInput';
import ClickSwitch from '../shared/ClickSwitch';
import AttributesEditor from './AttributesEditor';
import StatPane from './StatPane';
import ArmorPane from '../shared/ArmorPane';
import ActionPane from '../shared/ActionPane';

import { statCalc } from '../../services/charCalc';
import { makeInputOptions } from '../../services/detailStrings';

import {Character, Class, Attributes, CharType, Action} from '../../types';
import {InputOption} from '../../uiTypes';

interface CharBuilderInput {
    char: Character;
    classes: Class[],
    functions: any
}

export default function CharBuilder({char, classes, functions}: CharBuilderInput) {
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);
    const weapons: Action[] = char.actions.filter(action => action.isWeapon);
    const abilities: Action[] = char.actions.filter(action => !action.isWeapon);
    const charTypeOptions: InputOption[] = makeInputOptions(Object.keys(CharType));

    function updateName(newName: string): void {
        if(newName !== char.name) {
            const newChar: Character = {...char};
            newChar.name = newName;
            updateChar(newChar);
        }
    }

    function updateLevel(newLevel: number): void {
        if(newLevel !== char.level) {
            let newChar: Character = {...char};
            newChar.level = newLevel;
            newChar = statCalc(newChar);
            updateChar(newChar);
        }
    }

    function updateClass(newClass: Class): void {
        if(newClass !== char.class) {
            let newChar: Character = {...char};
            newChar.class = newClass;
            newChar.actions = newClass.actions;
            newChar.armor = newClass.armor;
            newChar = statCalc(newChar);
            updateChar(newChar);
        }
    }

    function updatePointBuy(attr: keyof Attributes, newValue: number): void {
        let newChar: Character = {...char};
        newChar.pointBuy[attr] = newValue;
        newChar = statCalc(newChar);
        updateChar(newChar);
    }

    function updateCharType(newType: CharType): void {updateChar({...char, type: newType})}

    function updateColor(color: string): void {
        let newChar: Character = {...char};
        newChar.color = color;
        updateChar(newChar);
    }

    function updateChar(newChar: Character): void {
        functions.updateChar(newChar);
        setUpdatesSaved(false);
    }

    function save(): void {
        if(!updatesSaved) {
            functions.saveChar(char); 
            setUpdatesSaved(true);
        }
    }

    function classList(): JSX.Element {
        return <div className="class-list">
            {classes.map(charClass => 
                <ClassPane 
                    charClass={charClass}
                    stats={char.stats}
                    isSelected={char.class._id === charClass._id}
                    selectClass={updateClass}
                    key={charClass._id}
                    isClassDisplay={true}
                />
            )}
        </div>
    }

  return (
    <div className="char-builder">
        <div className="left-column">
            <FaSave 
                className={`char-save-button ${!updatesSaved ? 'not-saved' : ''}`} 
                onClick={() => save()}
            />
            <div className="left-column-padding">
                <NameInput name={char.name} update={updateName} />
                <span className="class-name">{char.class.name}</span>
                <div className="level-input-row">
                    <label>Level:</label>
                    <NumStepper number={char.level} min={1} max={20} update={updateLevel} />
                </div>
                <ClickSwitch 
                    label="Type" 
                    currentValue={char.type} 
                    options={charTypeOptions} 
                    update={updateCharType}
                    centerAlignLabel={true}
                    leftAlignValue={true}
                />
                {classList()}
            </div>
        </div>
        <div className="central-section">
            <div className="central-section-padding">
                <AttributesEditor char={char} updatePb={updatePointBuy} updateColor={updateColor} />
                <StatPane stats={char.stats} />
                <div className="list-section">
                    <div className="list-section-padding">
                        <div className="list-column weapons">
                            <span className="list-column-label">Weapons</span>
                            <div className="list">
                                {weapons.map(weapon =>
                                    <ActionPane
                                        action={weapon}
                                        stats={char.stats}
                                        key={weapon._id}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="list-column abilities">
                            <span className="list-column-label">Abilities</span>
                            <div className="list">
                                {abilities.map(ability => 
                                    <ActionPane
                                        action={ability}
                                        stats={char.stats}
                                        key={ability._id}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="list-column armor" >
                            <span className="list-column-label">Armor</span>
                            <div className="list">
                                {char.class.armor.map(armor => 
                                    <ArmorPane armor={armor} key={armor._id} />    
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
