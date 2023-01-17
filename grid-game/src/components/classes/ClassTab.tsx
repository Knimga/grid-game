import { useState, useEffect } from 'react';

import { Button } from '@mui/material';

import ClassPane from '../shared/ClassPane';
import ClassBuilder from './ClassBuilder';

import {Class, Action, Armor} from '../../types/types';

import { blankClass } from '../../services/charCalc';

import urls from '../../urls';

export default function ClassTab() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class>();
    const [actions, setActions] = useState<Action[]>([]);
    const [armors, setArmors] = useState<Armor[]>([]);

    useEffect(() => {
        fetch(urls.localRoot+urls.classes.getAll)
            .then(res => res.json())
            .then((data) => setClasses(data.sort((a: Class, b: Class) => a.name > b.name ? 1 : -1)))
            .catch((err) => console.log(err))
    },[]);

    useEffect(() => {
        fetch(urls.localRoot+urls.actions.getAll)
            .then(res => res.json())
            .then((data) => setActions(data))
            .catch((err) => console.log(err))
    },[]);

    useEffect(() => {
        fetch(urls.localRoot+urls.armors.getAll)
            .then(res => res.json())
            .then((data) => setArmors(data))
            .catch((err) => console.log(err))
    },[]);



    function updateClass(newClass: Class): void {
        const newClasses: Class[] = [...classes];
        if(selectedClass) {
            const classIndex: number = classes.indexOf(selectedClass);
            newClasses[classIndex] = newClass;
            setClasses(newClasses);
            setSelectedClass(newClass);
        } else {console.log('could not find selectedChar')}
    }

    async function save<Class>(obj: Class): Promise<Class> {
        return fetch(urls.localRoot+urls.classes.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Class})
    }

    async function saveClass(charClass: Class) {
        if(selectedClass) {
            const newClass = await save(charClass);
            const newClasses: Class[] = [...classes];
            const classIndex = classes.indexOf(selectedClass);

            if(newClass) {
                if(classIndex === -1) {
                    newClasses.push(newClass)
                } else {newClasses[classIndex] = newClass}

                setClasses(newClasses);
                setSelectedClass(newClass);
            } else {console.log('no char returned from save operation')} 
        }
    }

    function newClass(): void {setSelectedClass(blankClass())}

  return (
    <div className="tab-container">
        <div className="top-bar">               
            <Button 
                variant="contained"
                className="button"
                onClick={() => newClass()}
            >+ New Class</Button>
        </div>
        <div className="main-section">
            <div className="pane-list">
                {
                    classes.map(charClass => 
                        <ClassPane 
                            charClass={charClass}
                            key={charClass._id}
                            stats={null}
                            isSelected={false}
                            selectClass={setSelectedClass}
                            isClassDisplay={true}
                        />
                    )
                }
            </div>
            {selectedClass ? 
                <ClassBuilder 
                    charClass={selectedClass} 
                    actions={actions} 
                    armors={armors} 
                    update={updateClass} 
                    save={saveClass}
                /> 
            : ''}
        </div>
    </div>
  )
}
