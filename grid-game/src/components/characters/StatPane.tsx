import './statPane.css';

import DmgTypeStatPane from '../shared/DmgTypeStatPane';

import { Stats } from '../../types/types';
import { DamageType } from '../../types/enums';

interface StatPaneInput {stats: Stats}

export default function StatPane({stats}: StatPaneInput) {
  return (
    <div className="stat-pane">
        <div className="left-list">
            <div className="list-row">
                <div className="list-label">HP:</div>
                <div className="list-value">{stats.hp}</div>
            </div>
            <div className="list-row">
                <small className="list-label">HP Regen:</small>
                <div className="list-value">{stats.hpRegen}</div>
            </div>
            <div className="list-row">
                <div className="list-label">MP:</div>
                <div className="list-value">{stats.mp}</div>
            </div>
            <div className="list-row">
                <small className="list-label">MP Regen:</small>
                <div className="list-value">{stats.mpRegen}</div>
            </div>
            <div className="list-row">
                <div className="list-label">AC:</div>
                <div className="list-value">{stats.ac}</div>
            </div>
            <div className="list-row">
                <div className="list-label">MAC:</div>
                <div className="list-value">{stats.mac}</div>
            </div>
            <div className="list-row">
                <div className="list-label">Initiative:</div>
                <div className="list-value">{stats.ini}</div>
            </div>
            <div className="list-row">
                <div className="list-label">Movement:</div>
                <div className="list-value">{stats.mvt}</div>
            </div>
            <div className="list-row">
                <small className="list-label">Healing Done/Rcvd:</small>
                <div className="list-value">
                    {`${stats.bonusHealingDone}/${stats.bonusHealingRcvd}`}
                </div>
            </div>
        </div>
        <div className="atk-bonus-list">
            <DmgTypeStatPane dmgType={DamageType.melee} baseBonuses={stats.dmgTypes.melee}/>
            <DmgTypeStatPane dmgType={DamageType.ranged} baseBonuses={stats.dmgTypes.ranged}/>
            <DmgTypeStatPane dmgType={DamageType.magic} baseBonuses={stats.dmgTypes.magic}/>
        </div>
        <div className="ele-bonus-list">
            <DmgTypeStatPane dmgType={DamageType.fire} baseBonuses={stats.dmgTypes.fire}/>
            <DmgTypeStatPane dmgType={DamageType.wind} baseBonuses={stats.dmgTypes.wind}/>
            <DmgTypeStatPane dmgType={DamageType.earth} baseBonuses={stats.dmgTypes.earth}/>
            <DmgTypeStatPane dmgType={DamageType.shadow} baseBonuses={stats.dmgTypes.shadow}/>
            <DmgTypeStatPane dmgType={DamageType.water} baseBonuses={stats.dmgTypes.water}/>
            <DmgTypeStatPane dmgType={DamageType.holy} baseBonuses={stats.dmgTypes.holy}/>
            <DmgTypeStatPane dmgType={DamageType.poison} baseBonuses={stats.dmgTypes.poison}/>
        </div>
    </div>
  )
}
