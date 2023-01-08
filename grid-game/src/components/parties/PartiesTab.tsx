import './partiesTab.css';

import urls from '../../urls';

import {Button} from '@mui/material';
import { FaArrowCircleLeft } from "react-icons/fa";

import PartyPane from './PartyPane';
import PartyMemberPane from './PartyMemberPane';

import {useState, useEffect} from 'react';

import { Party, PartyMember } from '../../types';

export default function PartiesTab() {
    const [parties, setParties] = useState<Party[]>([]);
    const [members, setMembers] = useState<PartyMember[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const emptyParty: Party = {_id: '', members: []};

    useEffect(() => {
        fetch(urls.localRoot + urls.parties.partiesTabData)
            .then(res => res.json())
            .then((data) => {setParties(data.parties); setMembers(data.members);})
            .catch((err) => console.log(err))
    },[]);

    function newParty(): void {
        setParties([emptyParty, ...parties])
    }

    function selectParty(index: number): void {setSelectedIndex(index)}

    function addPartyMember(index: number): void {
        parties[selectedIndex].members.push(members[index]);
        setParties([...parties]);
    }

    function removePartyMember(index: number): void {
        parties[selectedIndex].members.splice(index, 1);
        setParties([...parties]);
    }

    async function save<Party>(obj: Party): Promise<Party> {
        return fetch(urls.localRoot + urls.parties.save, urls.post(obj))
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(data => {return data as Party})
    }

    async function saveParty(party: Party) {
        const newParty = await save(party);
        if(newParty) {
            parties[selectedIndex] = newParty;
            setParties([...parties]);
        } else {console.log('no party returned from save operation')} 
    }

    //function deleteParty(_id: string) {}

  return (
    <div className="tab-container">
        <div className="top-bar">
            <Button 
                variant="contained"
                className="button"
                onClick={() => newParty()}
            >+ New Party</Button>
        </div>
        <div className="main-section">
            <div className="parties-list">
                {
                    parties.map((party, index) => 
                        <PartyPane 
                            key={party._id}    
                            party={party} 
                            isSelected={selectedIndex === index}
                            index={index}
                            selectParty={selectParty}
                            removeMember={removePartyMember}
                            saveParty={saveParty}
                        />
                    )
                }
            </div>
            <div className="party-members-list">
                <strong>Add Party Members</strong>
                {
                    members.map((member, index) => 
                        <div className="add-member-row" key={member._id}>
                            <FaArrowCircleLeft className="arrow-icons" onClick={() => addPartyMember(index)} />
                            <PartyMemberPane partyMember={member} />
                        </div>
                    )
                }
            </div>
        </div>
    </div>
  )
}
