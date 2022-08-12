import './armorPane.css';

import {Armor} from '../../types';

interface ArmorPaneInput {armor: Armor}

export default function ArmorPane({armor}: ArmorPaneInput) {
  return (
    <div className="armor-pane">
        <div className="armor-label">
            <strong>{armor.name}</strong>
        </div>
        <div className="armor-details">
            <small>{`AC: ${armor.ac}`}</small>
            <small>{`MAC: ${armor.mac}`}</small>
        </div>
    </div>
  )
}
