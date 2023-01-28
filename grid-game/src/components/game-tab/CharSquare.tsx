import './charSquare.css';

import { FaSkull } from 'react-icons/fa';

import HealthBar from './HealthBar';

import { GameChar, ActiveEffect } from '../../types/types';
import { DamageTypeColor, DamageTypeDarkColor, DamageType } from '../../types/enums';

interface CharSquareInput {
    char: GameChar,
    style: Object,
    index: number, 
    onClick: Function,
    onMouseOver: Function
}

export default function CharSquare({char, style, index, onClick, onMouseOver}: CharSquareInput) {
    let squareStyle: Object = {...style, backgroundColor: char.color};
    const uniqueActiveEffects: ActiveEffect[] = getUniqueActiveEffects();
    if(char.game.isTurn) squareStyle = {...squareStyle, color: 'white'};

    function effectInnerText(effect: ActiveEffect): string {
        if(['damage','dot','debuff'].includes(effect.type)) {
            return '-'
        } else {return '+'}
    }

    function dmgTypeStyle(dmgType: DamageType): Object {
        return {color: DamageTypeColor[dmgType], backgroundColor: DamageTypeDarkColor[dmgType]}
    }

    function getUniqueActiveEffects() {
        //this is here b/c a buff/debuff can affect more than one stat, 
        //and therefore can leave more than one AE on a char
        const AEs = char.game.activeEffects;
        const uniqueAEs: ActiveEffect[] = [];
        for (let i = 0; i < AEs.length; i++) {
            if(!uniqueAEs.find(ae => ae.actionName === AEs[i].actionName && ae.castById === AEs[i].castById)) 
                {uniqueAEs.push(AEs[i])}
        }
        return uniqueAEs;
    }
    
  return (
    <div 
        className="char-square"
        style={squareStyle}
        onClick={() => onClick(index)} 
        onMouseOver={() => onMouseOver(index)}
    >
        <div className="char-square-top">
            <div className="char-square-effects-row">            
                {uniqueActiveEffects.map(ae => 
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
            {char.game.isBoss ? <FaSkull className="skull-icon" /> : ''}
            <div className='char-square-name-row'>
                <span className="char-square-name">{char.name}</span>
            </div>          
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
