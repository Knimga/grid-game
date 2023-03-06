import './armorPane.css';

import KeyValuePill from '../KeyValuePill';

import { 
  cap, attrReqString, passiveEffectString, actionDetailString, randId 
} from '../../../services/detailStrings';

import {Armor} from '../../../types/types';
import { DamageTypeColor } from '../../../types/enums';

interface ArmorPaneInput {
  armor: Armor;
  isSelected?: boolean;
  onClick?: Function;
}

export default function ArmorPane({armor, isSelected, onClick}: ArmorPaneInput) {

  function click() {if(onClick) onClick(armor)}

  function actionDetailItem(prop: keyof Armor) {
    const detail = armorPropDetail(prop);
    return <KeyValuePill label={detail.label} value={detail.value} />
  }

  function armorPropDetail(prop: keyof Armor): {label: string, value: string | number} {
    switch(prop) {
      case 'ac': return {label: 'AC', value: armor.ac}
      case 'mac': return {label: 'MAC', value: armor.mac}
      case 'type': return {label: 'Type', value: cap(armor.type)}
      default: return {label: '?', value: '?'};
    }
  }

  function passives(): JSX.Element {
    if(!armor.passives.length) return <></>;
    return <div className="passives-column">
      {armor.passives.map(p => <small key={randId()}>{passiveEffectString(p)}</small>)}
    </div>
  }

  function attrReqs(): JSX.Element {
    if(!armor.attrReqs.length) return <></>;
    const reqStrings: string[] = armor.attrReqs.map(req => attrReqString(req));
    return <small>{`Requires ${reqStrings.join(', ')}`}</small>
  }

  function actions(): JSX.Element {
    if(!armor.actions.length) return <></>;
    return <div>
      <small>{`Provides `}</small>
      <small 
        style={{color: DamageTypeColor[armor.actions[0].dmgType]}}
        className="armor-action-tooltip"
        title={actionDetailString(armor.actions[0], null)}
      >
        {armor.actions[0].name}
      </small>
    </div>
  }

  return (
    <div className={`armor-pane ${isSelected ? 'selected-armor' : ''}`} onClick={() => click()}>
        <div className="armor-label">
            <strong>{armor.name}</strong>
            {passives()}
            {actions()}
            {attrReqs()}
        </div>
        <div className="armor-details">
            {actionDetailItem('type')}
            {actionDetailItem('ac')}
            {actionDetailItem('mac')}
        </div>
    </div>
  )
}
