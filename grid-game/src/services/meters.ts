import { ActionResult, GameChar } from "../types/types";
import { EffectTargetStat, EffectType } from "../types/enums";

export function updateMeters(
    actionResult: ActionResult, chars: GameChar[], actorGameId: string, targetGameId: string
): GameChar[] {
    let newChars: GameChar[] = chars;
    for (let i = 0; i < actionResult.effectResults.length; i++) {
        const thisEffect = actionResult.effectResults[i];
        
        if(thisEffect.effect.type === EffectType.threat) continue;
        
        switch(thisEffect.effect.type) {
            case 'healing': newChars = healingDone(newChars, actorGameId, thisEffect.effectiveAmount); 
                break;
            case 'damage': newChars = dmgDoneAndTaken(newChars, actorGameId, targetGameId, 
                thisEffect.effectiveAmount, thisEffect.effect.targetStat); 
                break;
            case 'buff': newChars = statEffectsDone(newChars, actorGameId, thisEffect.effectiveAmount); 
                break;
            case 'debuff': newChars = statEffectsDone(newChars, actorGameId, thisEffect.effectiveAmount); 
                break;
            default: break;
        }
    }
    return newChars;
}

export function dmgDoneAndTaken(
    chars: GameChar[], attackerId: string, targetId: string, dmgDealt: number, targetStat: EffectTargetStat
): GameChar[] {
    const attacker: GameChar | undefined = chars.find(c => c.game.gameId === attackerId);
    const target: GameChar | undefined = chars.find(c => c.game.gameId === targetId);
    const threatMultiplier: number = targetStat === 'hp' ? 1 : (1/3);
    if(attacker && target) {
        const attackerIndex: number = chars.indexOf(attacker);
        const targetIndex: number = chars.indexOf(target);
        chars[attackerIndex].game.meters.dmgDone += fl(dmgDealt * threatMultiplier);
        chars[attackerIndex].game.meters.threat = threatCalc(chars[attackerIndex]);
        chars[targetIndex].game.meters.dmgTaken += fl(dmgDealt * threatMultiplier);
    } else {console.log(`could not find char; attackerId: ${attackerId}, targetId: ${targetId}`)}
    return chars;
}

export function healingDone(chars: GameChar[], healerGameId: string, healAmount: number): GameChar[] {
    const healer: GameChar | undefined = chars.find(c => c.game.gameId === healerGameId);
    if(healer) {
        const healerIndex: number = chars.indexOf(healer);
        chars[healerIndex].game.meters.healingDone += healAmount;
        chars[healerIndex].game.meters.threat = threatCalc(chars[healerIndex]);
    } else {console.log('could not find char')}
    return chars;
}

export function statEffectsDone(chars: GameChar[], casterGameId: string, amount: number): GameChar[] {
    const caster: GameChar | undefined = chars.find(c => c.game.gameId === casterGameId);
    if(caster) {
        const casterIndex: number = chars.indexOf(caster);
        chars[casterIndex].game.meters.statEffectsDone += Math.abs(amount);
        chars[casterIndex].game.meters.threat = threatCalc(chars[casterIndex]);
    } else {console.log('could not find char')}
    return chars;
}

export function resetThreat(chars: GameChar[], charGameId: string): GameChar[] {
    const char: GameChar | undefined = chars.find(c => c.game.gameId === charGameId);
    if(char) {
        const charIndex: number = chars.indexOf(char);
        chars[charIndex].game.meters.threat = 0;
    }
    return chars;
}

function threatCalc(char: GameChar): number {
    let baseThreat: number = fl(char.game.meters.dmgDone * 0.4) 
        + fl(char.game.meters.healingDone * 0.6) + fl(char.game.meters.statEffectsDone * 0.3);
    if(baseThreat < 1) baseThreat = 1;
    return fl(baseThreat * char.game.stats.threatMultiplier);
}

function fl(n: number): number {return Math.floor(n)}