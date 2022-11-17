import './charStats.css';

import AttributeBars from '../shared/AttributeBars';
import AffinityBox from '../shared/AffinityBox';

import { cap } from '../../services/detailStrings';

import { GameChar, DamageTypes, Affinities } from '../../types';

interface CharStatsInput {char: GameChar | null}

export default function CharStats({char}: CharStatsInput) {
    const hpBarStyle: Object = char ? {width: `${(char.game.stats.hp / char.stats.hp) * 100}%`} : {}
    const mpBarStyle: Object = char ? {width: `${(char.game.stats.mp / char.stats.mp) * 100}%`} : {}

    const charNameColor: Object = char ? {backgroundColor: char.color} : {};

    const elements: (keyof Affinities)[] = ['fire','wind','earth','shadow','water','holy','poison'];

    function topSection(): JSX.Element {
        if(char) {
            return <div className="top-section">
                <div className="char-stats-name-bar" style={charNameColor}>
                    <strong>{char.name}</strong>
                    <span>{char.class.name}</span>
                </div>
                <div className="char-stats-hp-bar-container">
                    <div className="char-stats-hp-bar" style={hpBarStyle}></div>
                </div>
                <div className="char-stats-mp-bar-container">
                    <div className="char-stats-mp-bar" style={mpBarStyle}></div>
                </div>
                <span>{`HP: ${char.game.stats.hp}/${char.stats.hp} (+${char.game.stats.hpRegen})`}</span>
                <small>{`MP: ${char.game.stats.mp}/${char.stats.mp} (+${char.game.stats.mpRegen})`}</small>
            </div>
        } else {return <></>}
    }

    function diffStyle(diff: number): Object {
        if(diff === 0) return {}
        if(diff > 0) return {color: 'chartreuse'}
        return {color: 'red'}
    }

    function statsBlockRow(label: string, gameStatValue: number, statValue: number, style?: Object): JSX.Element {
        return <div className="char-stats-block-row" style={style ?? {}}>
            <div className="char-stat-label">{label}</div>
            <div className="char-stat-value" style={diffStyle(gameStatValue - statValue)}>
                {gameStatValue}
            </div>
        </div>
    }

    function statList(): JSX.Element {
        if(char) {
            return <div className="char-stats-block-column">
                <AttributeBars attributes={char.game.attributes} />
                {statsBlockRow('AC:', char.game.stats.ac, char.stats.ac)}
                {statsBlockRow('MAC:', char.game.stats.mac, char.stats.mac)}
                {statsBlockRow('Ini:', char.game.stats.ini, char.stats.ini)}
                {statsBlockRow('Mvt:', char.game.stats.mvt, char.stats.mvt)}
                {statsBlockRow('Healing Done:', char.game.stats.bonusHealingDone, char.stats.bonusHealingDone)}
                {statsBlockRow('Healing Rcvd:', char.game.stats.bonusHealingRcvd, char.stats.bonusHealingRcvd)}
            </div>
                
        } else {return <></>}
    }

    function bonuses(): JSX.Element {
        if(char) {
            const dmgTypes: DamageTypes = char.stats.dmgTypes;
            const gameDmgTypes: DamageTypes = char.game.stats.dmgTypes;
            return <div className="char-stats-block-column">
                <div className="atk-bonus-pane">
                    <div className="atk-bonus-label">Melee</div>
                    <div className="atk-bonus-values">
                        <span 
                            style={diffStyle(gameDmgTypes.melee.atk - dmgTypes.melee.atk)}
                        >{`Attack: ${gameDmgTypes.melee.atk}`}</span>
                        <span 
                            style={diffStyle(gameDmgTypes.melee.dmg - dmgTypes.melee.dmg)}
                        >{`Damage: ${gameDmgTypes.melee.dmg}`}</span>
                        <span 
                            style={diffStyle(gameDmgTypes.melee.dr - dmgTypes.melee.dr)}
                        >{`DR: ${gameDmgTypes.melee.dr}`}</span>
                    </div>
                </div>
                <div className="atk-bonus-pane">
                    <div className="atk-bonus-label">Ranged</div>
                    <div className="atk-bonus-values">
                        <span 
                            style={diffStyle(gameDmgTypes.ranged.atk - dmgTypes.ranged.atk)}
                        >{`Attack: ${gameDmgTypes.ranged.atk}`}</span>
                        <span 
                            style={diffStyle(gameDmgTypes.ranged.dmg - dmgTypes.ranged.dmg)}
                        >{`Damage: ${gameDmgTypes.ranged.dmg}`}</span>
                        <span 
                            style={diffStyle(gameDmgTypes.ranged.dr - dmgTypes.ranged.dr)}
                        >{`DR: ${gameDmgTypes.ranged.dr}`}</span>
                    </div>
                </div>
                <div className="atk-bonus-pane">
                    <div className="atk-bonus-label">Magic</div>
                    <div className="atk-bonus-values">
                        <span 
                            style={diffStyle(gameDmgTypes.magic.atk - dmgTypes.magic.atk)}
                        >{`Attack: ${gameDmgTypes.magic.atk}`}</span>
                        <span 
                            style={diffStyle(gameDmgTypes.magic.dmg - dmgTypes.magic.dmg)}
                        >{`Damage: ${gameDmgTypes.magic.dmg}`}</span>
                        <span 
                            style={diffStyle(gameDmgTypes.magic.dr - dmgTypes.magic.dr)}
                        >{`DR: ${gameDmgTypes.magic.dr}`}</span>
                    </div>
                </div>
                <div className="char-stats-affinities-container">
                   
                       
                </div>
            </div>
        } else {return <></>}
    }



  return (
    <div className="char-stats">
        <div className="char-stats-padding">
            {topSection()}
            {
                char ? 
                    <div className="char-stats-block">
                        {statList()}
                        {bonuses()}
                    </div>
                : ''
            }
        </div>
    </div>
  )
}
