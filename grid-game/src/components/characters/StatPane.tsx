import './statPane.css';

import {Stats} from '../../types';

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
            <div className="atk-bonus-pane">
                <div className="atk-bonus-label">Melee</div>
                <div className="atk-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.melee.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.melee.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.melee.dr}`}</span>
                </div>
            </div>
            <div className="atk-bonus-pane">
                <div className="atk-bonus-label">Ranged</div>
                <div className="atk-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.ranged.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.ranged.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.ranged.dr}`}</span>
                </div>
            </div>
            <div className="atk-bonus-pane">
                <div className="atk-bonus-label">Magic</div>
                <div className="atk-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.magic.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.magic.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.magic.dr}`}</span>
                </div>
            </div>
        </div>
        <div className="ele-bonus-list">
            <div className="ele-bonus-pane">
                <div className="ele-bonus-label fire">Fire</div>
                <div className="ele-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.fire.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.fire.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.fire.dr}`}</span>
                </div>
            </div>
            <div className="ele-bonus-pane">
                <div className="ele-bonus-label wind">Wind</div>
                <div className="ele-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.wind.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.wind.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.wind.dr}`}</span>
                </div>
            </div>
            <div className="ele-bonus-pane">
                <div className="ele-bonus-label earth">Earth</div>
                <div className="ele-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.earth.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.earth.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.earth.dr}`}</span>
                </div>
            </div>
            <div className="ele-bonus-pane">
                <div className="ele-bonus-label shadow">Shadow</div>
                <div className="ele-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.shadow.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.shadow.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.shadow.dr}`}</span>
                </div>
            </div>
            <div className="ele-bonus-pane">
                <div className="ele-bonus-label water">Water</div>
                <div className="ele-bonus-values">
                    <span>{`Attack: ${stats.dmgTypes.water.atk}`}</span>
                    <span>{`Damage: ${stats.dmgTypes.water.dmg}`}</span>
                    <span>{`DR: ${stats.dmgTypes.water.dr}`}</span>
                </div>
            </div>
        </div>
    </div>
  )
}
