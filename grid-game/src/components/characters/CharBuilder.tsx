import {useState, useEffect} from 'react';
import { FaSave } from "react-icons/fa";

import './charBuilder.css';

import NumStepper from '../shared/NumStepper';
import ClassPane from '../shared/panes/ClassPane';
import NameInput from '../shared/NameInput';
import ClickSwitch from '../shared/ClickSwitch';
import AttributesEditor from './AttributesEditor';
import StatPane from './StatPane';
import TalentTierPane from '../shared/panes/TalentTierPane';

import ArmorPane from '../shared/panes/ArmorPane';
import ActionPane from '../shared/panes/ActionPane';
import WeaponPane from '../shared/panes/WeaponPane';

import { statCalc, getCharActions, getCharWeapons, newInventory } from '../../services/charCalc';
import { makeInputOptions, randId } from '../../services/detailStrings';
import urls from '../../urls';

import {Character, Class, Attributes, Talent, Weapon} from '../../types/types';
import { CharType } from '../../types/enums';
import {InputOption} from '../../types/uiTypes';

interface CharBuilderInput {
    char: Character;
    classes: Class[],
    functions: any
}

export default function CharBuilder({char, classes, functions}: CharBuilderInput) {
    const [updatesSaved, setUpdatesSaved] = useState<boolean>(true);
    const [talents, setTalents] = useState<Talent[][]>([]);
    const charWeapons: Weapon[] = getCharWeapons(char.inventory);
    const charTypeOptions: InputOption[] = makeInputOptions(Object.keys(CharType));

    useEffect(() => {
        if(!char.class._id) return;
        fetch(urls.localRoot+urls.classes.getTalentsByClassId(char.class._id))
            .then(res => res.json())
            .then((data) => setTalents(data))
            .catch((err) => console.log(err))
    },[char.class._id]);

    function updateName(newName: string): void {
        if(newName !== char.name) updateChar({...char, name: newName});
    }

    function updateLevel(newLevel: number): void {
        if(newLevel !== char.level) updateChar(statCalc({...char, level: newLevel}));
    }

    function updateClass(newClass: Class): void {
        if(newClass !== char.class) {
            updateChar(statCalc({
                ...char, 
                class: newClass, 
                selectedTalents: [],
                inventory: newInventory(newClass)
            }))
        }
    }

    function updatePointBuy(attr: keyof Attributes, newValue: number): void {
        let newChar: Character = {...char};
        newChar.pointBuy[attr] = newValue;
        newChar = statCalc(newChar);
        updateChar(newChar);
    }

    function updateCharType(newType: CharType): void {updateChar({...char, type: newType})}

    function updateColor(color: string): void {updateChar({...char, color: color})}

    function selectTalent(tierIndex: number, talentId: string): void {
        char.selectedTalents[tierIndex] = talentId;
        updateChar(statCalc({...char, actions: getCharActions(char)}));
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
            {classes.sort((a: Class, b: Class) => char.class.name === a.name ? -1 : 1).map(charClass => 
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
            <NameInput name={char.name} update={updateName} label="Name" />
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
        <div className="central-section">
            <div className="central-section-padding">
                <AttributesEditor char={char} updatePb={updatePointBuy} updateColor={updateColor} />
                <StatPane stats={char.stats} passives={char.class.passives} />
                <div className="list-section">
                    <div className="list-section-padding">
                        <div className="list-column">
                            <span className="list-column-label">Weapons</span>
                            <div className="list">
                                {charWeapons.map(weapon =>
                                    <WeaponPane
                                        weapon={weapon}
                                        stats={char.stats}
                                        key={weapon._id}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="list-column">
                            <span className="list-column-label">Abilities</span>
                            <div className="list">
                                {char.actions.filter(a => !a.isWeapon).map(ability => 
                                    <ActionPane
                                        action={ability}
                                        stats={char.stats}
                                        key={ability._id}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="list-column" >
                            <span className="list-column-label">Armor</span>
                            <div className="list">
                                {char.class.startingArmor.map(armor => 
                                    <ArmorPane armor={armor} key={armor._id} />    
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="char-talents">
                    {talents.map((talentTier, tierIndex) => 
                        <TalentTierPane
                            tierIndex={tierIndex}
                            charLevel={char.level}
                            talents={talentTier}
                            selectedTalentId={char.selectedTalents[tierIndex] || ''}
                            selectTalent={selectTalent}
                            stats={null}
                            key={randId()}
                        />
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}
