import { EffectTargetStat, TargetStatType } from "../types/enums";

//this whole thing might not be needed at all...

export function getTargetStatType(targetStat: EffectTargetStat): TargetStatType {
    switch(targetStat) {
        case 'threat': return TargetStatType.threat;
        case 'hp':
        case 'hpRegen':
        case 'mp':
        case 'mpRegen':
        case 'ac':
        case 'mac':
        case 'mvt':
        case 'initiative':
        case 'bonusHealingDone':
        case 'bonusHealingRcvd':
        case 'threatMultiplier':
        case 'allAtkRolls':
        case 'allDmgRolls':
        case 'allDr':
        case 'meleeAtk':
        case 'meleeDmg':
        case 'meleeDr':
        case 'rangedAtk':
        case 'rangedDmg':
        case 'rangedDr':
        case 'magicAtk':
        case 'magicDmg':
        case 'magicDr':
        case 'fireAtk':
        case 'fireDmg':
        case 'fireDr':
        case 'windAtk':
        case 'windDmg':
        case 'windDr':
        case 'earthAtk':
        case 'earthDmg':
        case 'earthDr':
        case 'shadowAtk':
        case 'shadowDmg':
        case 'shadowDr':
        case 'waterAtk':
        case 'waterDmg':
        case 'waterDr':
        case 'holyAtk':
        case 'holyDmg':
        case 'holyDr':
        case 'poisonAtk':
        case 'poisonDmg':
        case 'poisonDr':
        case 'lightningAtk':
        case 'lightningDmg':
        case 'lightningDr': return TargetStatType.stat;
        case 'strength':
        case 'finesse':
        case 'toughness':
        case 'mind':
        case 'spirit': return TargetStatType.attribute;
        case 'fireAff':
        case 'windAff':
        case 'earthAff':
        case 'shadowAff':
        case 'waterAff':
        case 'holyAff':
        case 'poisonAff':
        case 'lightningAff': return TargetStatType.affinity;
        default: console.log(`cannot find targetStat ${targetStat}!`); return TargetStatType.stat;
    }
}