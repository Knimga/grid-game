import './statPane.css';

import DmgTypeStatPane from '../shared/panes/DmgTypeStatPane';
import PassivePane from '../shared/panes/PassivePane';

import { charThreatString, randId } from '../../services/detailStrings';

import { Passive, Stats } from '../../types/types';
import { DamageType } from '../../types/enums';

interface StatPaneInput {stats: Stats, passives: Passive[]}

export default function StatPane({stats, passives}: StatPaneInput) {

    function listRow(label: string, value: string | number): JSX.Element {
        return <div className="list-row">
            <div className="list-label">{`${label}:`}</div>
            <div className="list-value">{value}</div>
        </div>
    }

  return (
    <div className="stat-pane">
        <div className="left-list">
            {listRow('HP', `${stats.hp} (+${stats.hpRegen})`)}
            {listRow('MP', `${stats.mp} (+${stats.mpRegen})`)}
            {listRow('AC', stats.ac)}
            {listRow('MAC', stats.mac)}
            {listRow('Initiative', stats.ini)}
            {listRow('Movement', stats.mvt)}
            {listRow('Healing Done/Rcvd', `${stats.bonusHealingDone}/${stats.bonusHealingRcvd}`)}
            {listRow('Threat', charThreatString(stats.threatMultiplier))}
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
            <DmgTypeStatPane dmgType={DamageType.lightning} baseBonuses={stats.dmgTypes.lightning} />
        </div>
        <div className="passive-list">
            {passives.map(passive => <PassivePane passive={passive} key={randId()}/>)}
        </div>
    </div>
  )
}
