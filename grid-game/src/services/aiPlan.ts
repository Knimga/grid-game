import { 
    getInRangeDest, newExploreDestination, randomMoveToIndex, getRemainingMvt,
    pathfinder
} from "./aiMove";

import { 
    whoNeedsHealing, hasBuff, canHeal, decidesToBuff, randomSort, sortedOffenseActions, 
    getHealingActions, sortToPreferStrongHeals, shouldHealSelf, randomSortedBuffActions,
    canBuffSelf
} from "./aiAct";

import { canSeePlayers, visiblePlayers } from "./los";
import { isDead } from "./miscGameLogic";
import { effectAlreadyApplied } from "./actions";

import { AiPlan, GameBoard, GameChar, Action } from "../types/types";
import { CharType, TargetingType } from "../types/enums";

interface Plans {preferred: AiPlan | null, viable: AiPlan | null}

export function aiPlan(
    chars: GameChar[], actor: GameChar, board: GameBoard, adjMatrix: number[][], roundNumber: number
): AiPlan {
    const needsHealing: GameChar[] = whoNeedsHealing(board);
    const shouldTryToHeal: boolean = needsHealing.length > 0 && canHeal(actor);
    
    let preferredPlan: AiPlan = {target: null, chosenAction: null, newDest: null}

    if(isExploreMode(actor, chars, board)) return explorationPlan(actor, board, roundNumber);

    if(shouldTryToHeal) {
        const healingPlans: Plans = getHealingPlans(actor, needsHealing, board, adjMatrix);
        if(healingPlans.viable) return healingPlans.viable;
        if(healingPlans.preferred) preferredPlan = healingPlans.preferred;
    }

    if(decidesToBuff(actor)) {
        const alliedTargets: GameChar[] = randomSort(chars.filter(c => c.type === CharType.enemy && !isDead(c)));
        const buffingPlans: Plans = getBuffingPlans(actor, alliedTargets, board, adjMatrix);
        
        if(buffingPlans.viable) return buffingPlans.viable;
        if(buffingPlans.preferred && isNullPlan(preferredPlan)) preferredPlan = buffingPlans.preferred;
    }

    const playersByThreat: GameChar[] = chars.filter(c => c.type === CharType.player && !isDead(c))
        .sort((a,b) => a.game.meters.threat > b.game.meters.threat ? -1 : 1);
    const sortedActions: Action[] = sortedOffenseActions(actor);
    const offensivePlans: Plans = findAiPlans(actor, playersByThreat, sortedActions, board, adjMatrix);

    if(offensivePlans.viable) return offensivePlans.viable;
    if(offensivePlans.preferred && isNullPlan(preferredPlan)) preferredPlan = offensivePlans.preferred;

    return preferredPlan;
}

function getHealingPlans(healer: GameChar, targets: GameChar[], board: GameBoard, adjMatrix: number[][]): Plans {
    let healingActions: Action[] = getHealingActions(healer);
    const targetsAreCritical: boolean = targets.some(c => c.game.stats.hp / c.stats.hp <= 0.4);
    if(targetsAreCritical) healingActions = sortToPreferStrongHeals(healingActions);
   
    if(shouldHealSelf(healer, targets)) {
        return findAiPlans(healer, [healer], healingActions, board, adjMatrix)
    } else {
        healingActions = healingActions.filter(a => a.target !== TargetingType.self)
    }
    
    return findAiPlans(healer, targets, healingActions, board, adjMatrix);
}

function getBuffingPlans(buffer: GameChar, targets: GameChar[], board: GameBoard, adjMatrix: number[][]): Plans {
    let buffActions: Action[] = randomSortedBuffActions(buffer);

    if(buffActions[0].target === TargetingType.self && canBuffSelf(buffer, buffActions[0])) {
        return findAiPlans(buffer, [buffer], [buffActions[0]], board, adjMatrix)
    } else {
        buffActions = buffActions.filter(a => a.target !== TargetingType.self)
    }

    return findAiPlans(buffer, targets, buffActions, board, adjMatrix)
}

function findAiPlans(
    actor: GameChar, sortedTargets: GameChar[], sortedActions: Action[], board: GameBoard, adjMatrix: number[][]
): Plans {   
    //the preferredPlan is the first valid plan discovered, regardless of whether dest is reachable this turn
    let preferredPlan: AiPlan | null = null;
    //the viablePlan is the first valid plan where dest is reachable this turn
    let viablePlan: AiPlan | null = null;

    //console.log(`${actor.name} - ${actor.game.gameId}: findAiPlans:`);
    //console.log(`sortedTargets: ${listLog(sortedTargets)}`);
    //console.log(`sortedActions: ${listLog(sortedActions)}`);

    for (let t = 0; t < sortedTargets.length; t++) {
        const thisTarget: GameChar = sortedTargets[t];
        for (let a = 0; a < sortedActions.length; a++) {
            const thisAction: Action = sortedActions[a];

            if(thisAction.target === TargetingType.self && thisTarget.game.gameId !== actor.game.gameId) continue;

            if(!effectAlreadyApplied(thisTarget.game.activeEffects, actor.game.gameId, thisAction.name)) {
                const thisInRangeDest: number | null = getInRangeDest(board, actor, thisAction, 
                    thisTarget.game.positionIndex, adjMatrix);
                
                //console.log(`target ${thisTarget.name}, action ${thisAction.name} - inRangeDest = ${thisInRangeDest}`);

                if(thisInRangeDest === null) break;

                const canReachDestThisTurn: boolean = destReachableThisTurn(actor, board, adjMatrix, thisInRangeDest);
                //console.log(`target ${thisTarget.name}, action ${thisAction.name} - ${canReachDestThisTurn ? 'CAN' : 'CANNOT'} reach dest this turn!`)

                if(!preferredPlan) {
                    preferredPlan = {target: thisTarget, chosenAction: thisAction, newDest: thisInRangeDest}
                }

                if(canReachDestThisTurn) {
                    viablePlan = {target: thisTarget, chosenAction: thisAction, newDest: thisInRangeDest};
                    return {preferred: preferredPlan, viable: viablePlan}
                }
            }
        }
    }

    return {preferred: preferredPlan, viable: viablePlan};
}

//function listLog(things: any[]): string {return things.map(t => t.name).join(', ')}

function destReachableThisTurn(
    mover: GameChar, board: GameBoard, adjMatrix: number[][], destIndex: number
): boolean {
    if(destIndex === mover.game.positionIndex) return true;
    const path: number[] = pathfinder(board, mover.game.positionIndex, destIndex, adjMatrix);
    return path.filter(i => i !== mover.game.positionIndex).length <= getRemainingMvt(mover);
}

function isNullPlan(plan: AiPlan): boolean {
    return plan.chosenAction === null && plan.target === null && plan.newDest === null
}

function isExploreMode(actor: GameChar, chars: GameChar[], board: GameBoard): boolean {
    if(actor.type === CharType.beast) return !canSeePlayers(board, actor.game.positionIndex);
    return visiblePlayers(chars).length ? false : true;
}

function explorationPlan(char: GameChar, board: GameBoard, roundNumber: number): AiPlan {
    let newDest: number | null = null;
    let target: GameChar | null = null;
    let chosenAction: Action | null = null;

    if(roundNumber === 1 && hasBuff(char)) {
        chosenAction = randomSortedBuffActions(char)[0];
        target = char;
    }

    if(char.type === CharType.beast) {
        return {chosenAction: chosenAction, target: target, newDest: randomMoveToIndex(board, char)}
    }

    if(!char.game.destinationIndex || char.game.positionIndex === char.game.destinationIndex) {
        const newExploreDest: number = newExploreDestination(board, char.game.positionIndex);
        newDest = newExploreDest;
    }

    return {chosenAction: chosenAction, target: target, newDest: newDest}
}