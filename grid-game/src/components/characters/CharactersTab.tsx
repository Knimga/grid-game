import {useState, useEffect} from 'react';

import {Button} from '@mui/material';

import './charactersTab.css';
import urls from '../../urls';
import {blankChar} from '../../services/charCalc';

import CharPane from './CharPane';
import CharBuilder from './CharBuilder';

import {Character, Class } from '../../types';

export default function CharactersTab() {
    const [chars, setChars] = useState<Character[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedChar, setSelectedChar] = useState<Character>(chars[0]);

    const charBuilderfunctions = {
        saveChar: saveChar,
        updateChar: updateChar,
    }

    useEffect(() => {
        fetch(urls.localRoot+urls.characters.getAll)
            .then(res => res.json())
            .then((data) => setChars(data.sort((a: Character, b: Character) => a.name > b.name ? 1 : -1)))
            .catch((err) => console.log(err))
    },[]);

    useEffect(() => {
        fetch(urls.localRoot+urls.classes.getAll)
            .then(res => res.json())
            .then((data) => setClasses(data))
            .catch((err) => console.log(err))
    },[]);


    function selectChar(char: Character): void {setSelectedChar(char)}

    function updateChar(char: Character): void {
        const newChars: Character[] = [...chars];
        if(selectedChar) {
            const charIndex: number = chars.indexOf(selectedChar);
            newChars[charIndex] = char;
            setChars(newChars);
            setSelectedChar(char);
        } else {console.log('could not find selectedChar')}
    }

    async function save<Character>(obj: Character): Promise<Character> {
        return fetch(urls.localRoot+urls.characters.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Character})
    }

    async function saveChar(char: Character) {
        if(selectedChar) {
            const newChar = await save(char);
            const newChars: Character[] = [...chars];
            const charIndex = chars.indexOf(selectedChar);

            if(newChar) {
                if(charIndex === -1) {
                    newChars.push(newChar)
                } else {
                    newChars[charIndex] = newChar
                }
                setChars(newChars);
                setSelectedChar(newChar);
            } else {console.log('no char returned from save operation')} 
        }
    }

    function newChar(): void {
        const newCharObj: Character | null = blankChar(classes);
        if(newCharObj) setSelectedChar(newCharObj);
    }

    function charPanes(): JSX.Element {
        return <div className="char-list">
            {chars.map(char => 
                <CharPane 
                    char={char} 
                    selectChar={selectChar} 
                    key={char._id} 
                    isSelected={selectedChar ?  (char._id === selectedChar._id) : false} 
                />)
            }
        </div>
    }

    function charBuilder(): JSX.Element {
        if(selectedChar) {
            return <CharBuilder char={selectedChar} classes={classes} functions={charBuilderfunctions} />
        } else {return <div className="char-builder"></div>}
    }

    return (
        <div className="characters-container">
            <div className="chars-top-bar">               
                <Button 
                    variant="contained"
                    className="button"
                    onClick={() => newChar()}
                >+ New Character</Button>
            </div>
            <div className="main-section">
                {charPanes()}
                {charBuilder()}
            </div>
        </div>
    )
}
