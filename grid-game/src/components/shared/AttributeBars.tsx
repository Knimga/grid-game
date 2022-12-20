import './attributeBars.css';

import { attributeDetailString } from '../../services/detailStrings';

import { Attributes } from '../../types';

interface AttributeBarsInput {attributes: Attributes, isClassDisplay?: boolean}

export default function AttributeBars({attributes, isClassDisplay}: AttributeBarsInput) {
    function attributeString(attr: keyof Attributes): string {
        const attrValue: number = attributes[attr];
        const valueString: string = attrValue ? `+${attrValue}` : attrValue.toString(); 
        let attrAbbrev: string = '';
        switch(attr) {
            case 'strength': attrAbbrev = 'Str'; break;
            case 'finesse': attrAbbrev = 'Fin'; break;
            case 'toughness': attrAbbrev = 'Tns'; break;
            case 'mind': attrAbbrev = 'Min'; break;
            case 'spirit': attrAbbrev = 'Spt'; break;
            default: break;
        }
        return `${attrAbbrev} ${valueString}`;
    }

    function barStyle(attr: keyof Attributes): Object {
        const highestAttrValue: number = isClassDisplay ? 4 : Math.max(
            attributes.strength, attributes.finesse, attributes.toughness, 
            attributes.mind, attributes.spirit
        );
        return {width: `${(attributes[attr] / highestAttrValue) * 100}%`}
    }

    function attributeRow(attr: keyof Attributes): JSX.Element {
        return <div className="attribute-bars-row">
            <div 
                className="attribute-bars-label"
                title={attributeDetailString(attr)}
            >{attributeString(attr)}</div>
            <div className="attribute-bar-container">
                <div className="attribute-bar" style={barStyle(attr)}></div>
            </div>
        </div>
    }

  return (
    <div className="attribute-bars-container">
        {attributeRow('strength')}
        {attributeRow('finesse')}
        {attributeRow('toughness')}
        {attributeRow('mind')}
        {attributeRow('spirit')}
    </div>
  )
}
