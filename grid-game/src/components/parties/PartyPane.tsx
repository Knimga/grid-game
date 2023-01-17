import { FaCircle, FaSave, FaTrashAlt } from 'react-icons/fa';

import './partiesTab.css';

import {Party} from '../../types/types';

interface PartyPaneInput {
    party: Party;
    isSelected: boolean;
    index: number;
    selectParty: Function;
    removeMember: Function;
    saveParty: Function;
}

export default function PartyPane({party, isSelected, index, selectParty, removeMember, saveParty}: PartyPaneInput) {

    //<FaTrashAlt className="trash-icons" />

    function partyMembers(): JSX.Element {
        if(party.members.length) {
            return <div className="inner-container">       
                <div className="party-pane-header">
                    {isSelected ? <FaSave className="party-save-button" onClick={() => saveParty(party)} /> : ''}
                </div>
                {
                    party.members.map((char, index) => {
                        return <div className="party-member-row" key={char._id}>
                            <div className="party-member-trash-container">
                                {isSelected ? <FaTrashAlt className="trash-icons" onClick={() => removeMember(index)} /> : ''}
                            </div>
                            <FaCircle style={{color: char.color}} />
                            <strong>{char.name}</strong>
                            <small>{`${char.class} - Level ${char.level}`}</small>
                        </div>
                    })
                }
            </div>                          
        } else {
            return <div className="inner-container">
                <div className="party-member-row"><small>Add party members...</small></div>
            </div>
        }
    }

  return (
    <div className={`party-pane ${isSelected ? 'selected' : ''}`} onClick={() => selectParty(index)}>
        {partyMembers()}
    </div>
  )
}
