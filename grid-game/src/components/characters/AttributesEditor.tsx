import './attributesEditor.css';

import NumStepper from '../shared/NumStepper';
import ColorPicker from '../shared/ColorPicker';

import { applyAttrPassives } from '../../services/charCalc';
import { attributeDetailString } from '../../services/detailStrings';
import { attrPointsPerLevel } from '../../services/charCalc';

import {Character, Attributes} from '../../types/types';

interface AttributesInput {
    char: Character,
    updatePb: Function,
    updateColor: Function
}

export default function AttributesEditor({char, updatePb, updateColor}: AttributesInput) {
    const pbMax: number = char.level * attrPointsPerLevel;
    const pbTotal: number = pointBuyTotal();
    const classAttrBonuses: Attributes = getClassAttrBonuses();

    function pointBuyTotal(): number {
        const pbValues: number[] = [
            char.pointBuy.strength,
            char.pointBuy.finesse,
            char.pointBuy.toughness,
            char.pointBuy.mind,
            char.pointBuy.spirit
        ];
        return pbValues.reduce((a,b) => a + b);
    }

    function getClassAttrBonuses(): Attributes {
        let attributes: Attributes = {...char.class.attributes};
        attributes[char.class.attributeFocus[0]] += char.level;
        attributes[char.class.attributeFocus[1]] += char.level;
        return applyAttrPassives(attributes, char.class.passives.map(p => p.effects).flat(1));
    }

    function attributeColumn(attrName: keyof Attributes): JSX.Element {
        return <div className="attr-column">
            <div 
                className="attr-display"
                title={attributeDetailString(attrName)}
            >
                <strong className="attr-value">{char.attributes[attrName]}</strong>
                <small className="attr-label">{attrName[0].toUpperCase() + attrName.substring(1)}</small>
            </div>
            <div className="attr-class">{classAttrBonuses[attrName]}</div>
            <NumStepper 
                number={char.pointBuy[attrName]}
                min={0}
                max={100}
                update={updatePb} 
                attr={attrName} 
            />
        </div>
    }

    function pbSpendCss(): string {
        if(pbTotal > pbMax) return 'red';
        if(pbTotal < pbMax) return 'green';
        return '';
    }

  return (
    <div className="attributes-container">
        <div className="labels-column">
            <ColorPicker label={"Token Color"} color={char.color} update={updateColor} />
            <span>Class Bonuses:</span>
            <span className={`pb-label ${pbSpendCss()}`}>
                {`Point Buy (${pbTotal}/${pbMax}):`}
            </span>
        </div>
        {attributeColumn('strength')}
        {attributeColumn('finesse')}
        {attributeColumn('toughness')}
        {attributeColumn('mind')}
        {attributeColumn('spirit')}
    </div>
  )
}
