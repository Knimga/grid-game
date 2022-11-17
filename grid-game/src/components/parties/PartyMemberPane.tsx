import './partiesTab.css';

import { FaCircle } from 'react-icons/fa';

import { PartyMember } from '../../types';

interface PartyMemberPaneInput {
    partyMember: PartyMember
}

export default function PartyMemberPane({partyMember}: PartyMemberPaneInput) {
  return (
    <div className="party-member-pane">
        <div className="party-member-row">
            <FaCircle style={{color: partyMember.color}} />
            <strong>{partyMember.name}</strong>
        </div>
        <div className="party-member-row">
            <small>{`${partyMember.class} - Level ${partyMember.level}`}</small>
        </div>
    </div>
  )
}
