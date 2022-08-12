import { EffectTargetStat, GameChar } from "../types";
import { MetersEntry } from "../uiTypes";

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
    meters: MetersEntry[], healerGameId: string, healAmount: number, targetStat: EffectTargetStat
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
        newMeters[meterIndex].meters.healingDone += Math.floor(amount / 2);
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
    return Math.floor(meterEntry.meters.dmgDone * 0.5) + Math.floor(meterEntry.meters.healingDone * 0.5)
}

export function createMeters(chars: GameChar[]): MetersEntry[] {
    if(!chars.length) {console.log('no chars...')}
    return chars.map(char => {
        return {
            gameId: char.game.gameId,
            charName: char.name,
            charType: char.type,
            color: char.color,
            meters: {
                dmgDone: 0,
                dmgTaken: 0,
                healingDone: 0,
                threat: 0
            }
        }
    })
}

function fl(n: number): number {return Math.floor(n)}