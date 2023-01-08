import './doorPane.css';

import NameInput from "../shared/NameInput";
import Dropdown from '../shared/Dropdown';

import { doorNameString, doorNameFormat } from '../../services/boards';

import { Door } from "../../types";
import { InputOption, DoorToBoardMap } from '../../uiTypes';

interface DoorPaneInput {
    door: Door;
    index: number;
    inputOptions: InputOption[];
    doorToBoardMap: DoorToBoardMap[];
    update: Function;
}

export default function DoorPane({door, index, inputOptions, doorToBoardMap, update}: DoorPaneInput) {

    const filteredOptions: InputOption[] = inputOptions.filter(o => o.enumValue !== door.id);

    function updateName(newDoorName: string): void {
        door.name = [door.name[0], door.name[1], doorNameFormat(newDoorName)];
        update(door, index);
    }

    function updateLeadsTo(leadsToDoorId: string) {
        const leadsToDoor = doorToBoardMap.find(item => item.doorId === leadsToDoorId)
            || {boardId: '',  doorId: ''};
        door.leadsTo = leadsToDoor;
        update(door, index, true);
    }

  return (
    <div className="pane door-pane">
        <small>{door.id}</small>
        <small>{doorNameString(door.name)}</small>
        <NameInput name={door.name[2]} update={updateName} />
        <Dropdown 
            label={"Leads To"} 
            options={filteredOptions}
            selectedOpt={door.leadsTo.doorId}
            hideLabel={false}
            update={updateLeadsTo}
        />
    </div>
  )
}
