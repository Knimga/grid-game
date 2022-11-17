import { GameBoard, GameChar, CharType, Action, ClassRole, ActiveEffect } from "../types";
import { MetersEntry } from "../uiTypes";
import { pathfinder } from "./aiMove";
import { effectAlreadyApplied, getTargetTypes } from "./actions";
import { distance, getInRangeIndices } from "./ranger";
import { rand } from "./roller";

export function selectOffensiveAction(char: GameChar, targetIsAdjacent: boolean, targetActiveEffects: ActiveEffect[]): Action {
    let actions: Action[] = char.actions.filter(action => {
        return action.intent === 'offense' && action.mpCost <= char.game.stats.mp
    });

    actions = actions.filter(action => 
        !effectAlreadyApplied(targetActiveEffects, char.game.gameId, action.name)
    );

    if(char.class.role === ClassRole.magic && (char.game.stats.mp / char.stats.mp < 0.2)) {
        actions = actions.filter(action => action.isWeapon)
    }

    if(char.class.role === ClassRole.support && (char.game.stats.mp / char.stats.mp < 0.33)) {
        actions = actions.filter(action => action.isWeapon)
    }

    if(!targetIsAdjacent) actions = actions.filter(action => action.range > 0);

    if(!actions.length) {
        console.log(`no actions for ${char.name}!`);
        console.log(`all actions: ${char.actions.map(a => a.name)}`);
    }

    const randomIndex: number = Math.floor(Math.random() * actions.length);
    return actions[randomIndex];
}

export function selectHealAndTarget(char: GameChar, needsHealing: GameChar[]): 
{spell: Action, target: GameChar} | null {
    if(!needsHealing.length) return null;

    const healingSpells: Action[] = char.actions.filter(action => 
        action.effects.some(effect => effect.type === 'healing' || effect.type === 'hot')
            && char.game.stats.mp >= action.mpCost
    );

    if(!healingSpells.length) return null;

    const randomIndex: number = Math.floor(Math.random() * healingSpells.length);

    for (let t = 0; t < needsHealing.length; t++) {
        const spellsAlreadyApplied: boolean[] = healingSpells.map(spell => 
            effectAlreadyApplied(needsHealing[t].game.activeEffects, char.game.gameId, spell.name)
        );
        if(spellsAlreadyApplied.every(boolean => !boolean)) {
            return {spell: healingSpells[randomIndex], target: needsHealing[t]}
        } else {
            for (let s = 0; s < spellsAlreadyApplied.length; s++) {
                if(!spellsAlreadyApplied[s]) return {spell: healingSpells[s], target: needsHealing[t]}
            }    
        }
    }
    
    return null;
}

export function selectBuff(char: GameChar): Action {
    const buffs: Action[] = char.actions.filter(action => action.effects.some(effect => effect.type === 'buff'));
    const randomIndex: number = Math.floor(Math.random() * buffs.length);
    return buffs[randomIndex];
}

export function selectTarget(
    board: GameBoard, targeter: GameChar, meters: MetersEntry[]
): GameChar {
    let targetPlayerId: string;

    const visiblePlayerIds: string[] = board.chars.filter(
        char => char.type === 'player' && char.game.isVisible
    ).map(char => char.game.gameId);

    const playerMeters: MetersEntry[] = meters.filter(
        meter => meter.charType === 'player' && visiblePlayerIds.includes(meter.gameId)
    );

    if(playerMeters.length === 1) {
        targetPlayerId = playerMeters[0].gameId
    } else {
        const allThreatEqual: boolean = playerMeters.every(
            meter => meter.meters.threat === playerMeters[0].meters.threat
        );

        if(allThreatEqual) {
            const playerChars: GameChar[] = board.chars.filter(char => char.type === 'player');
            let shortestDistance: GameChar = playerChars[0];

            for (let i = 1; i < playerChars.length; i++) {
                const distanceToLastOne: number = distance(
                    targeter.game.positionIndex, shortestDistance.game.positionIndex, board.gridWidth
                );

                const distanceToThisOne: number = distance(
                    targeter.game.positionIndex, playerChars[i].game.positionIndex, board.gridWidth
                );

                if(distanceToThisOne < distanceToLastOne) shortestDistance = playerChars[i];
            }

            targetPlayerId = shortestDistance.game.gameId;
        } else {
            //let highestThreat: MetersEntry = playerMeters[0];
            //players whose threat amount is >= the 85th percentile of all threat
            const highestThreatValue: number = Math.max(...playerMeters.map(m => m.meters.threat));

            const threateningPlayers: MetersEntry[] = playerMeters.filter(
                player => player.meters.threat / highestThreatValue >= 0.85
            );

            const randIndex: number = rand(threateningPlayers.length) - 1;

            targetPlayerId = threateningPlayers[randIndex].gameId;

            /*for (let i = 1; i < playerMeters.length; i++) {
                if(playerMeters[i].meters.threat > highestThreat.meters.threat) {
                    highestThreat = playerMeters[i]
                }
            }
            targetPlayerId = highestThreat.gameId;*/
        }
    }   

    const targetChar = board.chars.find(char => char.game.gameId === targetPlayerId);
    if(targetChar) {
        return targetChar
    } else {
        console.log('cannot find targetchar...');
        return board.chars[0];
    }
}

export function getNearestPlayer(board: GameBoard, enemyPosition: number, adjMatrix: number[][]): GameChar {
    const players: GameChar[] = board.chars.filter(char => char.type === 'player');
    const paths: {playerChar: GameChar, path: number[]}[] = [];

    for (let i = 0; i < players.length; i++) {
        const path: number[] = pathfinder(board, enemyPosition, players[i].game.positionIndex, adjMatrix);
        if(path.length > 0) {
            paths.push({playerChar: players[i], path: path})
        } else {players.splice(i, 1)}
    }

    if(!paths.length) return board.chars.filter(char => char.type === 'player')[0];

    const lengths: number[] = paths.map(path => path.path.length);
    const shortestLengthIndex: number = lengths.indexOf(Math.min(...lengths));
    return paths[shortestLengthIndex].playerChar;
}

export function getRandomBuffTarget(chars: GameChar[], caster: GameChar, buff: Action): GameChar {
    if(buff.range === 0) return caster;
    const targetTypes: CharType[] = getTargetTypes(buff.intent, caster.type);
    const targets: GameChar[] = chars.filter(
        char => {
            const activeEffectNames: string[] = char.game.activeEffects.map(ae => ae.actionName);
            return targetTypes.includes(char.type) && !activeEffectNames.includes(buff.name);
        }
    );

    if(targets.length) {
        const randomIndex: number = rand(targets.length) - 1;
        return targets[randomIndex];
    } else {return caster}
}

export function canHeal(char: GameChar): boolean {
    const healingSpells: Action[] = char.actions.filter(action => action.effects.some(effect => 
        effect.type === 'healing' || effect.type === 'hot'
    ));
    return healingSpells.length > 0 && healingSpells.some(spell => char.game.stats.mp >= spell.mpCost);
}

export function hasBuff(char: GameChar): boolean {
    return char.actions.some(action => action.effects.some(effect => effect.type === 'buff'))
}

export function whoNeedsHealing(board: GameBoard): GameChar[] {
    const lowHealthEnemies: GameChar[] = board.chars.filter(char => {
        return char.type === 'enemy' && char.game.stats.hp > 0 && char.game.stats.hp / char.stats.hp <= 0.6
    });
    return lowHealthEnemies.sort((a,b) => a.game.stats.hp - b.game.stats.hp);
}

//interface AoeLinePlacement {moveToIndex: number, castAtIndex: number}

export function findBestBurstPlacement(board: GameBoard, action: Action, casterGameId: string, targetCharIndex: number, adjMatrix: number[][]): number {
    if(action.burstRadius !== undefined) { //this can return indices with no adjIndices! This can return indices with chars on them!
        const playerIndices: number[] = board.chars.filter(char => char.type === 'player').map(char => char.game.positionIndex);
        let indicesWhereBurstHitsTarget: number[] = getInRangeIndices(board, targetCharIndex, action.burstRadius);
        
        if(action.range === 0) {
            const otherCharIndices: number[] = board.chars.filter(char => char.game.gameId !== casterGameId)
                .map(char => char.game.positionIndex);
            indicesWhereBurstHitsTarget = indicesWhereBurstHitsTarget.filter(index => !otherCharIndices.includes(index));
        }

        let burstPlacements: {targetIndex: number, burstIndices: number[]}[] = [];

        for (let i = 0; i < indicesWhereBurstHitsTarget.length; i++) {
            const thisIndex: number = indicesWhereBurstHitsTarget[i];
            let inRangeIndices: number[] = getInRangeIndices(board, thisIndex, action.burstRadius);

            if(action.range === 0) inRangeIndices = inRangeIndices.filter(index => adjMatrix[index].length > 0);

            if(inRangeIndices.length > 0) {
                burstPlacements.push({
                    targetIndex:  thisIndex,
                    burstIndices: [thisIndex, ...getInRangeIndices(board, thisIndex, action.burstRadius)]
                })
            }
        }

        burstPlacements = burstPlacements.filter(placement => placement.burstIndices.includes(targetCharIndex));

        const countOfPlayers: number[] = burstPlacements.map(placement => {
            return placement.burstIndices.filter(index => playerIndices.includes(index)).length
        });
        const maxPlayersIndex: number = countOfPlayers.indexOf(Math.max(...countOfPlayers));

        return burstPlacements[maxPlayersIndex].targetIndex;
    } else {console.log('not a burst action'); return -1}
}