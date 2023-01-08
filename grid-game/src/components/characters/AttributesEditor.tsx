import './attributesEditor.css';

import NumStepper from '../shared/NumStepper';
import ColorPicker from '../shared/ColorPicker';

import { attributeDetailString } from '../../services/detailStrings';

import {Character, Attributes} from '../../types';

interface AttributesInput {
    char: Character,
    updatePb: Function,
    updateColor: Function
}

export default function AttributesEditor({char, updatePb, updateColor}: AttributesInput) {
    const pbMax: number = char.level * 4;
    const pbTotal: number = pointBuyTotal();

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

    function classAttrString(attr: keyof Attributes): string {
        let value: number = char.class.attributes[attr];
        if(char.class.attributeFocus.includes(attr)) value += char.level;
        return value === 0 ? '0' : `+${value}`;
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
            <div className="attr-class">{classAttrString(attrName)}</div>
            <NumStepper 
                number={char.pointBuy[attrName]}
                min={0}
                max={100}
                update={updatePb} 
                attr={attrName} 
            />
        </div>
    }

  return (
    <div className="attributes-container">
        <div className="labels-column">
            <ColorPicker label={"Token Color"} color={char.color} update={updateColor} />
            <span>Class Bonuses:</span>
            <span className={`pb-label ${pbTotal > pbMax ? 'red' : ''}`}>
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
