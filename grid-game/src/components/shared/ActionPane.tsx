import './actionPane.css';

import {Action, Effect, Stats, DamageTypeColor, DamageTypeDarkColor} from '../../types';

import { getAtkBonus }  from '../../services/charCalc';
import { cap, effectDamageString, effectDmgDesc, effectDurationString } from '../../services/detailStrings';

interface ActionPaneInput {
    action: Action,
    stats: Stats | null,
    isSelected?: boolean,
    onClick?: Function,
    index?: number
}

export default function ActionPane({action, stats, isSelected, onClick, index}: ActionPaneInput) {
    const hasEnoughMp: boolean = stats ? (stats.mp >= action.mpCost) : true;
    const dmgTypeString: string = cap(action.dmgType);

    const targetString = (): string => {
        if(action.burstRadius) return `Burst ${action.burstRadius}`;
        return action.target === 'single' ? cap(action.target) + ' Target' : cap(action.target);
    }

    function atkBonus(): string {
        const bonus: number = stats ? getAtkBonus(stats, action.dmgType) : 0;
        return bonus > 0 ? `+${bonus}` : `${bonus}`;
    }

    function effectRowStyle(effect: Effect): Object {
        return {color: DamageTypeColor[effect.dmgType], backgroundColor: DamageTypeDarkColor[effect.dmgType]}
    }

    function click() {if(onClick && index !== undefined) onClick(action)}

  return (
    <div 
        className={`action-pane ${isSelected ? 'action-pane-selected' : ''}`}
        key={action._id}
        onClick={() => click()}
    >
        <div className="action-pane-header-row">
            <strong style={{color: hasEnoughMp ? DamageTypeColor[action.dmgType] : 'gray'}}>
                {action.name}
            </strong>
            <small className="action-desc-string">
                {action.isWeapon ? ` ${dmgTypeString} Weapon` : `${targetString()}, MP ${action.mpCost}`}
            </small>
        </div>
        <div className="action-pane-details-row">  
            <div className="action-pane-detail">
                {action.effects.map(effect => {
                    return <div 
                        className="action-pane-effect-box" 
                        key={Math.random()}
                        style={effectRowStyle(effect)}
                    >
                        <div className="effect-damage">{effectDamageString(effect, stats)}</div>
                        <div className="effect-damage-detail">
                            <span className="effect-dmg-desc">{effectDmgDesc(effect)}</span>
                            <div className="effect-duration">{effectDurationString(effect)}</div>
                        </div>
                    </div>
                })}
            </div>
            <div className="action-pane-detail-list">
                {stats && action.type === 'offense' ? <small>{`Attack: ${atkBonus()}`}</small> : ''}
                {targetString() === 'Self' ? '' : <small>{`Range: ${action.range}`}</small>}
            </div>
        </div>
    </div>
  )
}
