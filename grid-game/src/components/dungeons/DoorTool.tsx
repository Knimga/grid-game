import { ToolType } from '../../types/uiTypes';

import { GiWoodenDoor } from 'react-icons/gi';

interface DoorToolInput {
    toolIsActive: boolean;
    selectTool: Function;
} 

export default function DoorTool({toolIsActive, selectTool}: DoorToolInput) {

    function toggleActive(): void {
        toolIsActive = !toolIsActive;
        selectTool(toolIsActive ? ToolType.door : ToolType.none); 
    }

  return (
    <div className="terrain-tool-container" onClick={() => toggleActive()}>
        <div className={`brush-box ${toolIsActive ? 'outline' : ''}`}>
            <GiWoodenDoor className="door-icon"/>
        </div>
        <small className={`brush-name ${toolIsActive ? 'lightblue' : ''}`}>Door</small>
    </div>
  )
}
