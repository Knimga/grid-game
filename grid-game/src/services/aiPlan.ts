import { AiPlan, GameBoard, GameChar, CharType, ClassRole, Action } from "../types";
import { MetersEntry } from "../uiTypes";

import { canSeePlayers, visiblePlayers } from "./los";
import { distance } from "./ranger";
import { getInRangeDest, newExploreDestination, randomMoveToIndex } from "./aiMove";

import { 
    whoNeedsHealing, selectHealAndTarget, selectTarget, selectOffensiveAction, getNearestPlayer, 
    hasBuff, selectBuff, getRandomBuffTarget 
} from "./aiAct";


export function aiPlan(
    chars: GameChar[], char: GameChar, board: GameBoard, meters: MetersEntry[], 
    adjMatrix: number[][], roundNumber: number
): AiPlan {

    const isBeast: boolean = char.type === CharType.beast;
    const exploreMode: boolean = isBeast ? !canSeePlayers(board, char.game.positionIndex) 
        : (visiblePlayers(chars).length ? false : true);
    const needsHealing: GameChar[] = whoNeedsHealing(board);
    const healSpellAndTarget = selectHealAndTarget(char, needsHealing);

    let newDest: number | null = null;
    let target: GameChar | null = null;
    let chosenAction: Action | null = null;

    if(needsHealing.length && healSpellAndTarget) {
        chosenAction = healSpellAndTarget.spell;
        target = healSpellAndTarget.target;
        newDest = getInRangeDest(board, char, chosenAction, target.game.positionIndex, adjMatrix);
    } else if(!exploreMode) {
        const chanceToCastBuff: number = char.class.role === ClassRole.support ? 0.15 : 0.1;

        if(hasBuff(char) && Math.random() <= chanceToCastBuff) {
            chosenAction = selectBuff(char);
            target = getRandomBuffTarget(chars, char, chosenAction);
            newDest = getInRangeDest(board, char, chosenAction, target.game.positionIndex, adjMatrix);
        } else {
            target = selectTarget(board, char, meters);
            const targetIsAdjacent: boolean = distance(
                char.game.positionIndex, target.game.positionIndex, board.gridWidth
            ) === 1;
            chosenAction = selectOffensiveAction(char, targetIsAdjacent, target.game.activeEffects);
            newDest = getInRangeDest(board, char, chosenAction, target.game.positionIndex, adjMatrix);
            if(!newDest) {
                target = getNearestPlayer(board, char.game.positionIndex, adjMatrix)
                newDest = getInRangeDest(board, char, chosenAction, target.game.positionIndex, adjMatrix);
            }
        }

    } else {
        if(roundNumber === 1 && hasBuff(char)) {
            chosenAction = selectBuff(char);
            target = char;
        }
        if((!char.game.destinationIndex || char.game.positionIndex === char.game.destinationIndex)
            && !isBeast) {
            const newExploreDest: number = newExploreDestination(board, char.game.positionIndex);
            newDest = newExploreDest;
        }
        if(isBeast) {
            newDest = randomMoveToIndex(board, char);
        }
    }

    return {newDest: newDest, target: target, chosenAction: chosenAction}
}