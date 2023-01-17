import { ActionResult, GameChar } from "../types/types";
import { EffectTargetStat } from "../types/enums";
import { MetersEntry } from "../types/uiTypes";

export function dmgDoneAndTaken(
    meters: MetersEntry[], attackerId: string, targetId: string, dmgDealt: number, targetStat: EffectTargetStat
): MetersEntry[] {
    const newMeters: MetersEntry[] = meters;
    const attackerEntry: MetersEntry | undefined = newMeters.find(entry => entry.gameId === attackerId);
    const targetEntry: MetersEntry | undefined = newMeters.find(entry => entry.gameId === targetId);
    const threatMultiplier: number = targetStat === 'hp' ? 1 : (1/3);
    if(attackerEntry && targetEntry) {
        const attackerMeterIndex: number = newMeters.indexOf(attackerEntry);
        const targetMeterIndex: number = newMeters.indexOf(targetEntry);
        newMeters[attackerMeterIndex].meters.dmgDone += fl(dmgDealt * threatMultiplier);
        newMeters[attackerMeterIndex].meters.threat = threatCalc(newMeters[attackerMeterIndex]);
        newMeters[targetMeterIndex].meters.dmgTaken += fl(dmgDealt * threatMultiplier);
    } else {console.log(`could not find meters entry; attackerId: ${attackerId}, targetId: ${targetId}`)}
    return newMeters;
}

export function healingDone(
    meters: MetersEntry[], healerGameId: string, healAmount: number
): MetersEntry[] {
    const newMeters: MetersEntry[] = meters;
    const healerEntry: MetersEntry | undefined = newMeters.find(entry => entry.gameId === healerGameId);
    if(healerEntry) {
        const meterIndex: number = newMeters.indexOf(healerEntry);
        newMeters[meterIndex].meters.healingDone += healAmount;
        newMeters[meterIndex].meters.threat = threatCalc(newMeters[meterIndex]);
    } else {console.log('could not find meters entry')}
    return newMeters;
}

export function statEffectsDone(meters: MetersEntry[], casterGameId: string, amount: number): MetersEntry[] {
    const newMeters: MetersEntry[] = meters;
    const casterEntry: MetersEntry | undefined = newMeters.find(entry => entry.gameId === casterGameId);
    if(casterEntry) {
        const meterIndex: number = newMeters.indexOf(casterEntry);
        newMeters[meterIndex].meters.statEffectsDone += Math.abs(amount);
        newMeters[meterIndex].meters.threat = threatCalc(newMeters[meterIndex]);
    } else {console.log('could not find meters entry')}
    return newMeters;
}

export function resetThreat(meters: MetersEntry[], charGameId: string): MetersEntry[] {
    const newMeters: MetersEntry[] = meters;
    const entry: MetersEntry | undefined = newMeters.find(entry => entry.gameId === charGameId);
    if(entry) {
        const meterIndex: number = newMeters.indexOf(entry);
        newMeters[meterIndex].meters.threat = 0;
    }
    return newMeters;
}

function threatCalc(meterEntry: MetersEntry): number {
    let baseThreat: number = fl(meterEntry.meters.dmgDone * 0.4) 
        + fl(meterEntry.meters.healingDone * 0.6) + fl(meterEntry.meters.statEffectsDone * 0.3);
    if(baseThreat < 1) baseThreat = 1;
    return fl(baseThreat * meterEntry.charThreatMultiplier);
}

export function updateMeters(
    actionResult: ActionResult, meters: MetersEntry[], actorGameId: string, targetGameId: string
): MetersEntry[] {
    for (let i = 0; i < actionResult.effectResults.length; i++) {
        const thisEffect = actionResult.effectResults[i];                         
        
        switch(thisEffect.effect.type) {
            case 'healing': meters = healingDone(meters, actorGameId, thisEffect.effectiveAmount); 
                break;
            case 'damage': meters = dmgDoneAndTaken(meters, actorGameId, targetGameId, 
                thisEffect.effectiveAmount, thisEffect.effect.targetStat); 
                break;
            case 'buff': meters = statEffectsDone(meters, actorGameId, thisEffect.effectiveAmount); 
                break;
            case 'debuff': meters = statEffectsDone(meters, actorGameId, thisEffect.effectiveAmount); 
                break;
            default: break;
        }
    }
    return meters;
}

export function createMeters(chars: GameChar[]): MetersEntry[] {
    if(!chars.length) {console.log('no chars...')}
    return chars.map(char => {
        return {
            gameId: char.game.gameId,
            charName: char.name,
            charType: char.type,
            charThreatMultiplier: char.stats.threatMuliplier,
            color: char.color,
            meters: {
                dmgDone: 0,
                dmgTaken: 0,
                healingDone: 0,
                statEffectsDone: 0,
                threat: 0
            }
        }
    })
}

function fl(n: number): number {return Math.floor(n)}