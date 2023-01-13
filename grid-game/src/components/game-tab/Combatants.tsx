import './combatants.css';

import { GameChar } from '../../types';

interface CombatantsInput {
  chars: GameChar[];
  roundNumber: number;
}

export default function Combatants({chars, roundNumber}: CombatantsInput) {
  const knownChars: GameChar[] = chars.filter(c => c.game.hasBeenSeen);

  function combatantClasses(char: GameChar): string {
    let string: string = '';
    if(char.game.isTurn) string += 'is-turn';
    if(char.game.stats.hp <= 0) string += ' dead-char';
    return string;
  }

  return (
    <div className="combatants">
      <strong>{`Round ${roundNumber}`}</strong>
      {
        knownChars.map(char => 
          <div className={'combatant '+ combatantClasses(char)} key={char.game.gameId}>
            <span className="combatant-name">{char.name}</span>
            <span className="combatant-ini-value">{char.game.iniRoll}</span>
          </div>
        )
      }
    </div>
  )
}
