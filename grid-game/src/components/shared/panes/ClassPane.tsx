import './classPane.css';

import { FaRegQuestionCircle } from "react-icons/fa";

import AttributeBars from '../AttributeBars';

import {Class, Stats, AttributeFocus, Action} from '../../../types/types';
import {actionDetailString, armorDetailString} from '../../../services/detailStrings';

interface ClassPaneInput {
    charClass: Class,
    stats: Stats | null,
    isSelected: boolean,
    selectClass: Function,
    isClassDisplay?: boolean
}

export default function ClassPane({charClass, stats, isSelected, selectClass, isClassDisplay}: ClassPaneInput) {
    const actions: Action[] = [
        ...charClass.startingActions, 
        ...charClass.startingWeapons.map(w => w.action)
    ]

    function keyAttrList(keyAttributes: AttributeFocus): string {
        if(keyAttributes.length) {
            return keyAttributes.map(
                attr => attr[0].toUpperCase() + attr.substring(1)
            ).join(', ')
        } else {return 'None'}
    }

  return (
    <div 
        className={`class-pane ${isSelected ? 'selected-class' : ''}`} 
        onClick={() => selectClass(charClass)}
        key={charClass._id}
    >
        <div className="class-pane-padding">
            <div className="class-pane-header-row">
                <strong>{charClass.name}</strong>
                <FaRegQuestionCircle className="class-tooltip" title={charClass.desc} />
            </div>
            <div className="class-pane-body">
                <div className="class-pane-attributes">
                    <span>
                        {`Role: ${charClass.role[0].toUpperCase() + charClass.role.substring(1)}`}
                    </span>
                    <div className="key-attr-row">
                        <span>Focus: </span>
                        <small className="list-item">
                            {keyAttrList(charClass.attributeFocus)}
                        </small>
                    </div>
                    <AttributeBars attributes={charClass.attributes} isClassDisplay={isClassDisplay ?? false} />
                </div>
                <div className="class-pane-attacks-powers">
                    {
                        actions.length ?
                        <div className="list-grouping">
                            <div className="list-name">Actions</div>
                            {actions.map(action => 
                                <span 
                                    className="list-item" 
                                    title={actionDetailString(action, stats)}
                                    key={action._id}
                                >{action.name}</span>
                            )}
                        </div>
                        :''
                    }
                    {
                        charClass.startingArmor.length ?
                        <div className="list-grouping">
                            <div className="list-name">Armor</div>
                            {charClass.startingArmor.map(armor => 
                                <span 
                                    className="list-item" 
                                    key={armor._id}
                                    title={armorDetailString(armor)}
                                >{armor.name}</span>
                            )}
                        </div>
                        : ''
                    }
                    
                </div>
            </div>
        </div>
    </div>
  )
}
