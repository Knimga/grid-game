import './board.css';

import HealthBar from './HealthBar';

import { GameChar, ActiveEffect, DamageTypeColor, DamageTypeDarkColor, DamageType } from '../../types';

interface CharSquareInput {
    char: GameChar,
    style: Object,
    index: number, 
    onClick: Function,
    onMouseOver: Function
}

export default function CharSquare({char, style, index, onClick, onMouseOver}: CharSquareInput) {
    let squareStyle: Object = {...style, backgroundColor: char.color};
    if(char.game.isTurn) squareStyle = {...squareStyle, color: 'white'};

    function effectInnerText(effect: ActiveEffect): string {
        if(['damage','dot','debuff'].includes(effect.type)) {
            return '-'
        } else {return '+'}
    }

    function dmgTypeStyle(dmgType: DamageType): Object {
        return {
            color: DamageTypeColor[dmgType],
            backgroundColor: DamageTypeDarkColor[dmgType]
        }
    }

    
  return (
    <div 
        className="char-square char-hover"
        style={squareStyle}
        onClick={() => onClick(index)} 
        onMouseOver={() => onMouseOver(index)}
    >
        <div className="char-square-top">
            <div className="char-square-effects-row">
                {char.game.activeEffects.map(ae => 
                    <div 
                        className="char-square-effect"
                        style={dmgTypeStyle(ae.dmgType)}
                        title={`${ae.actionName}`}
                        key={Math.random()}
                    ><small>{effectInnerText(ae)}</small></div>
                )}
            </div>
        </div>
        <div className="char-square-bottom">
            <span className="char-square-name">{char.name}</span>
            <HealthBar 
                currentHp={char.game.stats.hp} 
                totalHp={char.stats.hp}
                currentMp={char.game.stats.mp} 
                totalMp={char.stats.mp}
            />
        </div>
    </div>
  )
}
