import './weaponPane.css';

import KeyValuePill from '../KeyValuePill';

import { 
  weaponTypeString, passiveEffectString, attrReqString, actionDetailString, randId 
} from '../../../services/detailStrings';
import { getAtkBonus } from '../../../services/charCalc';

import { Weapon, Stats } from '../../../types/types';
import { DamageTypeColor } from '../../../types/enums';

interface WeaponPaneInput {
    weapon: Weapon;
    stats: Stats | null;
    isSelected?: boolean;
    onClick?: Function;
    index?: number;
}

export default function WeaponPane({weapon, stats, isSelected, onClick, index}: WeaponPaneInput) {

  const nameTextColor: Object = {color: DamageTypeColor[weapon.action.dmgType]}

  function click() {if(onClick) onClick(weapon)}

  function weaponDescString(): string {
    return `${weapon.hands}h ${weaponTypeString(weapon.type)} weapon`
  }

  function attrReqs(): JSX.Element {
    if(!weapon.attrReqs.length) return <></>;
    const reqStrings: string[] = weapon.attrReqs.map(req => attrReqString(req));
    return <small className="weapon-pane-gray-text">{`Requires ${reqStrings.join(', ')}`}</small>
  }

  function passives(): JSX.Element {
    if(!weapon.passives.length) return <></>;
    return <div className="weapon-passives-column">
      {weapon.passives.map(p => <small key={randId()}>{passiveEffectString(p)}</small>)}
    </div>
  }

  function actions(): JSX.Element {
    if(!weapon.otherActions.length) return <></>;
    return <div>
      <small>{`Provides `}</small>
      <small 
        style={{color: DamageTypeColor[weapon.otherActions[0].dmgType]}}
        className="armor-action-tooltip"
        title={actionDetailString(weapon.otherActions[0], null)}
      >
        {weapon.otherActions[0].name}
      </small>
    </div>
  }

  function atkBonusString(): string {
    if(!stats) return 'no stats';
    const bonus: number = getAtkBonus(stats, weapon.action.dmgType);
    const operator: string = bonus >= 0 ? '+' : '-';
    return operator+bonus;
  }

  return (
    <div 
        className={`action-pane ${isSelected ? 'action-pane-selected' : ''}`}
        key={weapon._id}
        onClick={() => click()}
    >
        <div className="action-detail-desc-column">
            <div>
                <strong style={nameTextColor}>
                  {weapon.name}
                </strong>
            </div>
            <small className="weapon-pane-gray-text">{weaponDescString()}</small>
            <small>{actionDetailString(weapon.action, stats, weapon.hands)}</small>
            {attrReqs()}
            {passives()}
            {actions()}
        </div>
        <div className="action-detail-items-column">
          {stats ? <KeyValuePill label="Attack" value={atkBonusString()} /> : ''}
          {weapon.action.range > 1 ? <KeyValuePill label="Range" value={weapon.action.range} /> : ''}
        </div>
    </div>
  )
}
