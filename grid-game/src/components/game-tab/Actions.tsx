import './actions.css';
import {useState} from 'react';

import {Button} from '@mui/material';

import ActionPane from '../shared/ActionPane';
import CharStatBlock from '../shared/CharStatBlock';

import {getRemainingMvt} from '../../services/aiMove';

import {GameChar, Action} from '../../types/types';
import {CharType} from '../../types/enums';

interface ActionsInput {
    char: GameChar;
    enableDoorButton: boolean;
    actionFunctions: any;
}

enum ActionCategory {
    weapons = 'weapons',
    abilities = 'abilities',
    stats = 'stats'
}

export default function Actions({char, enableDoorButton, actionFunctions}: ActionsInput) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ActionCategory>(
        ['melee', 'ranged'].includes(char.class.role) ? ActionCategory.weapons : ActionCategory.abilities
    );

    const remainingMvt: number = char.game.stats.mvt - char.game.round.movementTaken;
    const actionRemaining: boolean = !char.game.round.actionTaken;

    const weapons: Action[] = char.actions.filter(action => action.isWeapon);
    const abilities: Action[] = char.actions.filter(action => !action.isWeapon)
        .sort((a,b) => a.mpCost > b.mpCost ? 1 : -1);

    const hpBarStyle: Object = {width: `${(char.game.stats.hp / char.stats.hp) * 100}%`};
    const mpBarStyle: Object = {width: `${(char.game.stats.mp / char.stats.mp) * 100}%`};

    function setActionCategory(type: ActionCategory): void {
        setSelectedCategory(type);
        setSelectedId(null);
    }

    function clickActionPane(id: string) {
        const action = char.actions.find(action => action._id === id);
        if(action) {
            if(actionRemaining && char.game.stats.mp >= action.mpCost) {
                if(id === selectedId) {
                    setSelectedId(null);
                    actionFunctions.selectAction(action, true);
                } else {
                    setSelectedId(id);
                    actionFunctions.selectAction(action);
                }
            }  
        }  
    }

    function endTurn(): void {
        setSelectedId(null);
        actionFunctions.endTurn();
    }

    function playerNameHeader(char: GameChar): JSX.Element {
        if(char.type === CharType.player) {
            return <div className="char-name-bar" style={{backgroundColor: char.color}}>
                <strong>{char.name}</strong>
                <small>{char.class.name}</small>
            </div>
        } else {return <></>}
    }

    function enemyTurnDisplay(): JSX.Element {
        if(char.type !== CharType.player) {
            return <div className="actions-column">
                <strong className="enemy-turn-text">Enemy's turn...</strong>
            </div>
        } else {return <></>}
    }

    function weaponsList(): JSX.Element {
        if(selectedCategory === ActionCategory.weapons) {
            return <div className="action-list">
                {weapons.map((action, index) => 
                    <ActionPane
                        action={action}
                        stats={char.game.stats}
                        onClick={() => clickActionPane(action._id)}
                        isSelected={selectedId === action._id && actionRemaining ? true : false}
                        index={index}
                        key={action.name}
                    />
                )}
            </div>
        } else {return <></>}
    }

    function abilitiesList(): JSX.Element {
        if(selectedCategory === ActionCategory.abilities) {
            return <div className="action-list">
                {abilities.map((action, index) => 
                    <ActionPane
                        action={action}
                        stats={char.game.stats}
                        onClick={() => clickActionPane(action._id)}
                        isSelected={selectedId === action._id && actionRemaining ? true : false}
                        index={index}
                        key={action._id}
                    />
                )}
            </div>
        } else {return <></>}
    }

    function statsBlock(): JSX.Element {
        if(selectedCategory === ActionCategory.stats) {
            return <CharStatBlock char={char}/>
        } else {return <></>}
    }

    function playerTurnDisplay(): JSX.Element {
        if(char.type === CharType.player) {
            return <div className="actions-column">
                <div className="char-bars-container">
                    <div className="char-stats-hp-bar-container">
                        <div className="char-stats-hp-bar" style={hpBarStyle}></div>
                    </div>
                    <div className="char-stats-mp-bar-container">
                        <div className="char-stats-mp-bar" style={mpBarStyle}></div>
                    </div>
                    <small>{`HP: ${char.game.stats.hp}/${char.stats.hp} (+${char.game.stats.hpRegen})`}</small>
                    <small>{`MP: ${char.game.stats.mp}/${char.stats.mp} (+${char.game.stats.mpRegen})`}</small>
                </div>
                <Button 
                    variant="contained"
                    disabled={!remainingMvt}
                    onClick={() => actionFunctions.showMovement()}
                >{`Move (${char ? getRemainingMvt(char) : 0}/${char ? char.game.stats.mvt : 0})`}</Button>
                <div className='action-container'>
                    <strong className={actionRemaining ? '' : 'disabled'}>
                        {`Actions ${actionRemaining ? 1 : 0}/1`}
                    </strong>
                    <div className="action-type-toggle-button-row">
                        <button 
                            className={`action-type-button  ${selectedCategory === ActionCategory.weapons ? 'action-type-selected' : ''}`} 
                            onClick={() => setActionCategory(ActionCategory.weapons)}
                        >Weapons</button>
                        <button 
                            className={`action-type-button  ${selectedCategory === ActionCategory.abilities ? 'action-type-selected' : ''}`} 
                            onClick={() => setActionCategory(ActionCategory.abilities)}
                        >Abilities</button>
                        <button 
                            className={`action-type-button  ${selectedCategory === ActionCategory.stats ? 'action-type-selected' : ''}`}
                            onClick={() => setActionCategory(ActionCategory.stats)}
                        >Stats</button>
                    </div>
                    {weaponsList()}
                    {abilitiesList()}
                    {statsBlock()}
                </div>
                <div className="flex-row-centered">
                    {enableDoorButton ? 
                        <Button variant="contained" onClick={() => actionFunctions.clickEnterDoor()}>
                            Enter Door
                        </Button>
                    : ''}
                    <Button 
                        variant="contained" 
                        onClick={() => endTurn()}
                    >End Turn</Button>
                </div>
                
            </div> 
        } else {return <></>}
    }

  return (
    <div className="actions">
        {playerNameHeader(char)}
        {enemyTurnDisplay()}
        {playerTurnDisplay()}
    </div>
  )
}
