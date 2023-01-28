import { ActionResult, GameChar } from "../types/types";
import { CharType } from "../types/enums";
import { TurnLog } from '../types/uiTypes';

import { effectTargetStatString } from './detailStrings';

export const logger = {
    beginGame: beginGame,
    newRound: newRound,
    newTurn: newTurn,
    newUnseenTurn: newUnseenTurn,
    move: move,
    unseenMove: unseenMove,
    action: action,
    charDies: charDies,
    partyIsDead: partyIsDead,
    roomIsClear: roomIsClear,
    bossIsDefeated: bossIsDefeated
}

export function newTurnLog(firstTurnChar: GameChar): TurnLog[] {
    const newLog: TurnLog[] = [newRound(1), beginGame()];
    
    if(firstTurnChar.type === CharType.player || firstTurnChar.game.hasBeenSeen) {
        newLog.unshift(newTurn(firstTurnChar.name))
    }

    return newLog;
}

function beginGame(): TurnLog {
    return {header: `The game has begun!`, actions: []}
}

function newRound(roundNumber: number): TurnLog {
    return {header: `Round ${roundNumber}`, actions: []}
}

function newTurn(turnCharName: string): TurnLog {
    return {header: `${turnCharName}'s Turn`, actions: []}
}

function newUnseenTurn(): TurnLog {
    return {header: 'Enemies are acting...', actions: []}
}

function move(moverName: string, distanceMoved: number): string {
    return `${moverName} moved ${distanceMoved} spaces`
}

function unseenMove(moverName: string): string {
    return `${moverName} is acting...`
}

function action(actorName: string, actionResults: ActionResult[]): string[] {
    const targetNames: string[] = actionResults.map(result => result.newTargetChar.name);
    if(targetNames.length > 1) {
        targetNames[targetNames.length - 1] = `and `+targetNames[targetNames.length - 1]
    }
    const targetsString: string = targetNames.join(', ');
    let firstString: string = '';

    if(actionResults[0].action.isWeapon) {
        firstString = `${actorName} attacks ${actionResults[0].newTargetChar.name} with ${actionResults[0].action.name}`
    } else {
        firstString = `${actorName} casted ${actionResults[0].action.name} on ${targetsString}`
    }

    let actions: string[] = [firstString];   

    for (let r = 0; r < actionResults.length; r++) {
        let string: string = '';

        if(actionResults[r].success) {
            string += actionResults[r].newTargetChar.name;

            for (let e = 0; e < actionResults[r].effectResults.length; e++) {
                const effectResult = actionResults[r].effectResults[e];
                const amount: number = effectResult.effectiveAmount;
                const isFlatAmount: boolean = effectResult.effect.flatAmount !== undefined;
                const dmgRollString: string | undefined = isFlatAmount ? 
                   '' : actionResults[r].dmgRollResult?.summary;
    
                switch(effectResult.effect.type) {
                    case 'healing': string += ` healed for ${amount + (dmgRollString ? ` (${dmgRollString})` : '')}`; break;
                    case 'damage': string += ` takes ${amount + (dmgRollString ? ` (${dmgRollString})` : '')} ${effectResult.effect.dmgType} damage to ${effectTargetStatString(effectResult.effect.targetStat)}`; break;
                    case 'buff': string += ` gets +${amount} to ${effectTargetStatString(effectResult.effect.targetStat)} for ${effectResult.effect.duration} rounds`; 
                        break;
                    case 'debuff': string += ` gets ${amount} to ${effectTargetStatString(effectResult.effect.targetStat)} for ${effectResult.effect.duration} rounds`; 
                        break;
                    case 'hot': string += ` receives healing (${effectTargetStatString(effectResult.effect.targetStat)}) over time`; break;
                    case 'dot': string += ` receives ${effectResult.effect.dmgType} damage (${effectTargetStatString(effectResult.effect.targetStat)}) over time`; break;
                }
    
                if(e < actionResults[r].effectResults.length - 1) string += ',';
            }
        } else {
            const atkRollResult: string = actionResults[r].atkRollResult ? `(${actionResults[r].atkRollResult?.result})` : '';
            string = `${actionResults[0].action.name} MISSES ${atkRollResult} ${actionResults[r].newTargetChar.name}`
        }
        
        actions.push(string);
    }
    
    return actions;
}

function charDies(slayerName: string, slayeeName: string): string {
    return `${slayerName} has slain ${slayeeName}!`
}

function partyIsDead(): TurnLog {
    return {header: 'The players have lost...', actions: []}
}

function roomIsClear(): TurnLog {
    return {header: 'This room is clear of enemies... Doors may now be opened!', actions: []}
}

function bossIsDefeated(bossName: string): TurnLog {
    return {header: `You have defeated the powerful ${bossName} and completed the dungeon!`, actions: []}
}