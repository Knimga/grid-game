import './attrReqEditor.css';

import Dropdown from '../shared/Dropdown';
import NumStepper from '../shared/NumStepper';

import { makeInputOptions } from '../../services/detailStrings';

import { AttributeReq } from '../../types/types';
import { AttributeEnum } from '../../types/enums';
import { InputOption } from '../../types/uiTypes';

interface AttrReqEditorInput {
    attrReq: AttributeReq;
    update: Function;
}

export default function AttrReqEditor({attrReq, update}: AttrReqEditorInput) {
    const attrInputOptions: InputOption[] = makeInputOptions(Object.keys(AttributeEnum));

    function updateAttribute(newAttr: AttributeEnum): void {
        attrReq.attr = newAttr;
        update({...attrReq});
    }

    function updateMinAttrValue(newMinValue: number): void {
        attrReq.minAttrValue = newMinValue;
        update({...attrReq});
    }

  return (
    <div className="attr-req-editor-pane">
        <Dropdown 
            label="Attribute"
            selectedOpt={attrReq.attr}
            options={attrInputOptions}
            update={updateAttribute}
        />
        <div className="numstepper-row">
            <small>Min Attr. Value:</small>
            <NumStepper 
                number={attrReq.minAttrValue}
                min={1} max = {20}
                update={updateMinAttrValue}
            />
        </div>
    </div>
  )
}
