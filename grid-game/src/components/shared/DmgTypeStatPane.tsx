import './dmgTypeStatPane.css';

import { Bonuses } from "../../types/types";
import { DamageType, DamageTypeColor } from '../../types/enums';

import { cap } from "../../services/detailStrings";

interface DmgTypeStatPaneInput {
    dmgType: DamageType;
    baseBonuses: Bonuses;
    gameBonuses?: Bonuses;
}

export default function DmgTypeStatPane({dmgType, baseBonuses, gameBonuses}: DmgTypeStatPaneInput) {
    const bonuses: Bonuses = gameBonuses || baseBonuses;
    const dmgTypeStyle: Object = {color: DamageTypeColor[dmgType]};
    
    function buffDebuffColor(bonus: keyof Bonuses): Object {
        if(!gameBonuses) return {color: 'lightgray'}
        if(gameBonuses[bonus] - baseBonuses[bonus] > 0) return {color: 'chartreuse'}
        if(gameBonuses[bonus] - baseBonuses[bonus] < 0) return {color: 'red'}
        return {color: 'lightgray'}
    }

  return (
    <div className="dmg-type-stat-pane">
        <div className="dmg-type-bonus-label" style={dmgTypeStyle}>{cap(dmgType)}</div>
        <div className="dmg-type-bonus-values">
            <span style={gameBonuses ? buffDebuffColor('atk') : {}}>{`Attack: ${bonuses.atk}`}</span>
            <span style={gameBonuses ? buffDebuffColor('dmg') : {}}>{`Damage: ${bonuses.dmg}`}</span>
            <span style={gameBonuses ? buffDebuffColor('dr') : {}}>{`DR: ${bonuses.dr}`}</span>
        </div>
    </div>
  )
}
