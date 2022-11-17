import './actions.css';
import {useState} from 'react';

import {Button} from '@mui/material';

import ActionPane from '../shared/ActionPane';

import {GameChar, Action, CharType} from '../../types';

import {getRemainingMvt} from '../../services/aiMove';

interface ActionsInput {
    char: GameChar,
    gameIsActive: boolean;
    actionFunctions: any
}

enum ActionCategory {
    weapons = 'weapons',
    abilities = 'abilities'
}

export default function Actions({char, gameIsActive, actionFunctions}: ActionsInput) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ActionCategory>(ActionCategory.weapons);
    const remainingMvt: number = char ? char.game.stats.mvt - char.game.round.movementTaken : 0 ;
    const actionRemaining: boolean = char ? !char.game.round.actionTaken : false;

    const weapons: Action[] = char ? char.actions.filter(action => action.isWeapon) : [];
    const abilities: Action[] = char ? char.actions.filter(action => !action.isWeapon) : [];

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

    function enemyTurnDisplay(): JSX.Element {
        if(char && gameIsActive && char.type !== CharType.player) {
            return <div className="actions-column">
                <strong className="enemy-turn-text">Enemy's turn...</strong>
            </div>
        } else {return <></>}
    }

    function playerTurnDisplay(): JSX.Element {
        if(char && gameIsActive && char.type === CharType.player) {
            return <div className="actions-column">
                <Button 
                    variant="contained"
                    disabled={!remainingMvt || !gameIsActive}
                    onClick={() => actionFunctions.showMovement()}
                >{`Move (${char ? getRemainingMvt(char) : 0}/${char ? char.game.stats.mvt : 0})`}</Button>
                
                <div className={`action-container ${actionRemaining ? '' : 'disabled'}`}>
                    <strong>{`Actions ${actionRemaining ? 1 : 0}/1`}</strong>
                    <div className="action-type-toggle-button-row">
                        <button 
                            className={`action-type-button  ${selectedCategory === ActionCategory.weapons ? 'action-type-selected' : ''}`} 
                            onClick={() => setActionCategory(ActionCategory.weapons)}
                        >Weapons</button>
                        <button 
                            className={`action-type-button  ${selectedCategory === ActionCategory.abilities ? 'action-type-selected' : ''}`} 
                            onClick={() => setActionCategory(ActionCategory.abilities)}
                        >Abilities</button>
                    </div>
                    {weaponsList()}
                    {abilitiesList()}
                </div>
                <Button 
                    variant="contained" 
                    onClick={() => endTurn()}
                    disabled={!gameIsActive}
                >End Turn</Button>
            </div> 
        } else {return <></>}
    }

    function weaponsList(): JSX.Element {
        if(char && selectedCategory === ActionCategory.weapons) {
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
        if(char && selectedCategory === ActionCategory.abilities) {
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

    function endTurn(): void {
        setSelectedId(null);
        actionFunctions.endTurn();
    }

  return (
    <div className="actions">
        <strong>{(char && char.type === CharType.player && gameIsActive) ? char.name : ''}</strong>
        {enemyTurnDisplay()}
        {playerTurnDisplay()}
    </div>
  )
}
