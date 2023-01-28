import './armorPane.css';

import { allCaps } from '../../services/detailStrings';

import {Armor} from '../../types/types';

interface ArmorPaneInput {armor: Armor}

export default function ArmorPane({armor}: ArmorPaneInput) {

  function actionDetailItem(prop: keyof Armor) {
    return <div className="action-detail-item">
        <div className="action-detail-label">{allCaps(prop)}</div>
        <div className="action-detail-value">{armor[prop]}</div>
    </div>
}

  return (
    <div className="armor-pane">
        <div className="armor-label">
            <strong>{armor.name}</strong>
        </div>
        <div className="armor-details">
            <small>{actionDetailItem('ac')}</small>
            <small>{actionDetailItem('mac')}</small>
        </div>
    </div>
  )
}
