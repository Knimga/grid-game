import './combatants.css';

import { GameChar } from '../../types';

interface CombatantsInput {
  chars: GameChar[];
  turnIndex: number;
  gameIsActive: boolean;
  roundNumber: number;
}

export default function Combatants({chars, turnIndex, gameIsActive, roundNumber}: CombatantsInput) {
  //const sortedChars: GameChar[] = chars.sort((a,b) => {return b.game.iniRoll - a.game.iniRoll});

  function combatantClasses(listIndex: number): string {
    let string: string = '';
    if(gameIsActive && turnIndex === listIndex) string += 'is-turn';
    if(chars[listIndex].game.stats.hp <= 0) string += ' dead-char';
    return string;
  }

  return (
    <div className="combatants">
      <strong>{`Round ${roundNumber}`}</strong>
      {
        chars.map((char: GameChar, index: number) => 
          <div className={'combatant '+ combatantClasses(index)} key={char.game.gameId}>
            <span className="combatant-name">{char.name}</span>
            <span className="combatant-ini-value">{char.game.iniRoll}</span>
          </div>
        )
      }
    </div>
  )
}
