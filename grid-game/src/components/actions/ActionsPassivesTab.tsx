import './actionsTab.css';

import { useState, useEffect } from "react";

import { Button } from '@mui/material';

import ActionPane from '../shared/panes/ActionPane';
import ActionEditor from './ActionEditor';
import PassivePane from '../shared/panes/PassivePane';
import ClassPassiveEditor from './ClassPassiveEditor';

import urls from "../../urls";

import { blankAction } from '../../services/actions';
import { blankClassPassive } from '../../services/charCalc';

import { Action, Passive } from "../../types/types";

export default function ActionsPassivesTab() {
    const [actions, setActions] = useState<Action[]>([]);
    const [passives, setPassives] = useState<Passive[]>([]);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [selectedPassive, setSelectedPassive] = useState<Passive | null>(null);

    useEffect(() => {
        fetch(urls.localRoot+urls.actions.getAll)
            .then(res => res.json())
            .then((data) => {
                setActions(data.sort((a: Action, b: Action) => a.name > b.name ? 1 : -1)); 
                setSelectedAction(data[0]);
            }).catch((err) => console.log(err));
        fetch(urls.localRoot+urls.passives.getAll)
            .then(res => res.json())
            .then((data) => {
                setPassives(data.sort((a: Passive, b: Passive) => a.name > b.name ? 1 : -1)); 
                setSelectedPassive(data[0]);
            }).catch((err) => console.log(err))
    },[]);

    function sortActionsByName(): void {setActions([...actions].sort((a,b) => a.name > b.name ? 1 : -1))}
    function sortActionsByDmgType(): void {setActions([...actions].sort((a,b) => a.dmgType > b.dmgType ? 1 : -1))}

    function updateAction(action: Action): void {
        if(selectedAction) {
            const actionIndex: number = actions.indexOf(selectedAction);
            actions[actionIndex] = action;
            setActions(actions);
            setSelectedAction(action);
        } else {console.log('could not find selectedAction')}
    }

    async function saveActionToDb<Action>(obj: Action): Promise<Action> {
        return fetch(urls.localRoot+urls.actions.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Action})
    }

    async function saveAction(action: Action) {
        if(selectedAction) {
            const newAction = await saveActionToDb(action);
            const newActions: Action[] = [...actions];
            const actionIndex = actions.indexOf(selectedAction);

            if(newAction) {
                if(actionIndex === -1) {
                    newActions.push(newAction)
                } else {newActions[actionIndex] = newAction}

                setActions(newActions);
                setSelectedAction(newAction);
            } else {console.log('no action returned from save operation')} 
        }
    }

    function updatePassive(passive: Passive): void {
        if(selectedPassive) {
            const passiveIndex: number = passives.indexOf(selectedPassive);
            passives[passiveIndex] = passive;
            setPassives(passives);
            setSelectedPassive(passive);
        } else {console.log('ahhh halp')}
    }

    async function savePassiveToDb<Passive>(obj: Passive): Promise<Passive> {
        return fetch(urls.localRoot+urls.passives.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Passive})
    }

    async function savePassive(passive: Passive) {
        if(selectedPassive) {
            const newPassive = await savePassiveToDb(passive);
            const newPassives: Passive[] = [...passives];
            const passiveIndex = passives.indexOf(selectedPassive);

            if(newPassive) {
                if(passiveIndex === -1) {
                    newPassives.push(newPassive)
                } else {newPassives[passiveIndex] = newPassive}

                setPassives(newPassives);
                setSelectedPassive(newPassive);
            } else {console.log('no action returned from save operation')} 
        }
    }

    function actionsList(): JSX.Element {
        return <div className="pane-list action-passives-pane-list">
            <div className="sort-by-container">
                <strong>Sort by:</strong>
                <button className="sort-button" onClick={() => sortActionsByName()}>Name</button>
                <button className="sort-button" onClick={() => sortActionsByDmgType()}>Dmg Type</button>
            </div>
            {actions.map((action, index) => 
                <ActionPane
                    action={action}
                    key={action._id}
                    onClick={setSelectedAction}
                    stats={null}
                    index={index}
                    isSelected={selectedAction ?  (selectedAction._id === action._id) : false} 
                />
            )}
        </div>
    }

    function passivesList(): JSX.Element {
        return <div className="pane-list action-passives-pane-list">
            {passives.map((passive, index) => 
                <PassivePane
                    passive={passive}
                    key={passive._id}
                    onClick={setSelectedPassive}
                    isSelected={selectedPassive ?  (selectedPassive._id === passive._id) : false} 
                />
            )}
        </div>
    }

    function newAction(): void {setSelectedAction(blankAction())}
    function newPassive(): void {setSelectedPassive(blankClassPassive())}

  return (
    <div className="tab-container">
        <div className="top-bar">
            <div className="top-bar-half">
                <Button 
                    variant="contained"
                    className="button"
                    onClick={() => newAction()}
                >+ New Action</Button>
            </div>
            <div className="top-bar-half">
                <Button 
                    variant="contained"
                    className="button"
                    onClick={() => newPassive()}
                >+ New Passive</Button>
            </div>
        </div>
        <div className="main-section">
            {actionsList()}
            <div className="actions-passives-editor-container">
                {selectedAction ? 
                    <ActionEditor action={selectedAction} update={updateAction} save={saveAction} /> 
                : ''}
            </div>
            {passivesList()}
            <div className="actions-passives-editor-container">
                {selectedPassive ? 
                    <ClassPassiveEditor 
                        passive={selectedPassive} 
                        update={updatePassive} 
                        save={savePassive}
                    />
                : ''}
            </div>
        </div>
    </div>
  )
}
