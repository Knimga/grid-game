import './actionPane.css';

import KeyValuePill from '../KeyValuePill';

import {Action, Stats } from '../../../types/types';
import { DamageTypeColor, Intent } from '../../../types/enums';

import { getAtkBonus }  from '../../../services/charCalc';
import { cap, actionDetailString } from '../../../services/detailStrings';

interface ActionPaneInput {
    action: Action;
    stats: Stats | null;
    isSelected?: boolean;
    onClick?: Function;
    index?: number;
}

export default function ActionPane({action, stats, isSelected, onClick, index}: ActionPaneInput) {
    const hasEnoughMp: boolean = stats ? (stats.mp >= action.mpCost) : true;

    function click() {if(onClick && index !== undefined) onClick(action)}

    function actionDetailItem(prop: string) {
        const value: string = actionDetailItemValue(prop);
        const label: string = prop === 'mpCost' ? 'MP Cost' : cap(prop);
        return <KeyValuePill label={label} value={value} />
    }

    function actionDetailItemValue(prop: string): string {
        switch(prop) {
            case 'target': return targetString();
            case 'range': return rangeString();
            case 'mpCost': return action.mpCost ? action.mpCost.toString() : '-';
            case 'attack': return atkBonus();
            default: return '';
        }
    }

    function targetString(): string {
        if(action.burstRadius) return `Burst ${action.burstRadius}`;
        return cap(action.target);
    }

    function rangeString(): string {
        if(action.range === 0 || action.target === 'self') return 'On Self';
        return action.range.toString();
    }

    function atkBonus(): string {
        const bonus: number = stats ? getAtkBonus(stats, action.dmgType) : 0;
        return bonus > 0 ? `+${bonus}` : `${bonus}`;
    }

  return (
    <div 
        className={`action-pane ${isSelected ? 'action-pane-selected' : ''}`}
        key={action._id}
        onClick={() => click()}
    >
        <div className="action-detail-desc-column">
            <div>
                <strong style={{color: hasEnoughMp ? DamageTypeColor[action.dmgType] : 'gray'}}>
                    {action.name}
                </strong>
            </div>
            <small>{actionDetailString(action, stats)}</small>
        </div>
        <div className="action-detail-items-column">
            {action.isWeapon ? '' : actionDetailItem('mpCost')}
            {actionDetailItem('target')}
            {action.target !== 'self' ? actionDetailItem('range') : ''}
            {action.target !== 'self' && action.intent === Intent.offense && stats ? actionDetailItem('attack') : ''}
        </div>
    </div>
  )
}
