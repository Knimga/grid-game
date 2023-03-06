import './charStatBlock.css';

import AttributeBars from "./AttributeBars";
import DmgTypeStatPane from "./panes/DmgTypeStatPane";

import { GameChar, DamageTypes } from "../../types/types";
import { DamageType } from '../../types/enums';

interface CharStatBlockInput {char: GameChar}

export default function CharStatBlock({char}: CharStatBlockInput) {
    const base: DamageTypes = char.stats.dmgTypes;
    const game: DamageTypes = char.game.stats.dmgTypes

    function statsBlockRow(label: string, gameStatValue: number, statValue: number): JSX.Element {
        return <div className="char-stats-block-row">
            <div>{label}</div>
            <div style={diffStyle(gameStatValue - statValue)}>{gameStatValue}</div>
        </div>
    }

    function diffStyle(diff: number): Object {
        if(diff < 0) return {color: 'red'}
        if(diff > 0) return {color: 'chartreuse'}
        return {}
    }

  return (
    <div className="char-stats-block">
        <div className="char-stats-block-column main-stats">
            <AttributeBars attributes={char.game.attributes} />
            {statsBlockRow('AC:', char.game.stats.ac, char.stats.ac)}
            {statsBlockRow('MAC:', char.game.stats.mac, char.stats.mac)}
            {statsBlockRow('Ini:', char.game.stats.ini, char.stats.ini)}
            {statsBlockRow('Mvt:', char.game.stats.mvt, char.stats.mvt)}
            {statsBlockRow('Healing Done:', char.game.stats.bonusHealingDone, char.stats.bonusHealingDone)}
            {statsBlockRow('Healing Rcvd:', char.game.stats.bonusHealingRcvd, char.stats.bonusHealingRcvd)}
        </div>
        <div className="char-stats-block-column dmg-types">
            <DmgTypeStatPane dmgType={DamageType.melee} baseBonuses={base.melee} gameBonuses={game.melee}/>
            <DmgTypeStatPane dmgType={DamageType.ranged} baseBonuses={base.ranged} gameBonuses={game.ranged}/>
            <DmgTypeStatPane dmgType={DamageType.magic} baseBonuses={base.magic} gameBonuses={game.magic}/>
            <DmgTypeStatPane dmgType={DamageType.fire} baseBonuses={base.fire} gameBonuses={game.fire}/>
            <DmgTypeStatPane dmgType={DamageType.wind} baseBonuses={base.wind} gameBonuses={game.wind}/>
            <DmgTypeStatPane dmgType={DamageType.earth} baseBonuses={base.earth} gameBonuses={game.earth}/>
            <DmgTypeStatPane dmgType={DamageType.shadow} baseBonuses={base.shadow} gameBonuses={game.shadow}/>
            <DmgTypeStatPane dmgType={DamageType.water} baseBonuses={base.water} gameBonuses={game.water}/>
            <DmgTypeStatPane dmgType={DamageType.holy} baseBonuses={base.holy} gameBonuses={game.holy}/>
            <DmgTypeStatPane dmgType={DamageType.poison} baseBonuses={base.poison} gameBonuses={game.poison}/>
        </div>
    </div>
  )
}