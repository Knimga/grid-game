import './actionsTab.css';

import { useState, useEffect } from "react";

import { Button } from '@mui/material';

import ActionPane from '../shared/ActionPane';
import ActionEditor from './ActionEditor';

import urls from "../../urls";

import { blankAction } from '../../services/actions';

import { Action } from "../../types/types";

export default function ActionsTab() {
    const [actions, setActions] = useState<Action[]>([]);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);

    useEffect(() => {
        fetch(urls.localRoot+urls.actions.getAll)
            .then(res => res.json())
            .then((data) => {
                setActions(data.sort((a: Action, b: Action) => a.name > b.name ? 1 : -1)); 
                setSelectedAction(data[0]);})
            .catch((err) => console.log(err))
    },[]);

    function sortByName(): void {setActions([...actions].sort((a,b) => a.name > b.name ? 1 : -1))}
    function sortByDmgType(): void {setActions([...actions].sort((a,b) => a.dmgType > b.dmgType ? 1 : -1))}

    function updateAction(action: Action): void {
        if(selectedAction) {
            const actionIndex: number = actions.indexOf(selectedAction);
            actions[actionIndex] = action;
            setActions(actions);
            setSelectedAction(action);
        } else {console.log('could not find selectedAction')}
    }

    async function save<Action>(obj: Action): Promise<Action> {
        return fetch(urls.localRoot+urls.actions.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Action})
    }

    async function saveAction(action: Action) {
        if(selectedAction) {
            const newAction = await save(action);
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

    function actionsList(): JSX.Element {
        return <div className="pane-list">
            <div className="sort-by-container">
                <strong>Sort by:</strong>
                <button className="sort-button" onClick={() => sortByName()}>Name</button>
                <button className="sort-button" onClick={() => sortByDmgType()}>Dmg Type</button>
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

    function newAction(): void {setSelectedAction(blankAction())}

  return (
    <div className="tab-container">
        <div className="top-bar">
            <Button 
                variant="contained"
                className="button"
                onClick={() => newAction()}
            >+ New Action</Button>
        </div>
        <div className="main-section">
            {actionsList()}
            {selectedAction ? 
                <ActionEditor action={selectedAction} update={updateAction} save={saveAction} /> 
            : ''}
        </div>
    </div>
  )
}
