import './boardsTab.css';

import { ToolType } from '../../uiTypes';

import { GiMagicPortal } from 'react-icons/gi';

interface PortalToolInput {
    toolIsActive: boolean;
    selectTool: Function;
} 

export default function PortalTool({toolIsActive, selectTool}: PortalToolInput) {

    function toggleActive(): void {
        toolIsActive = !toolIsActive;
        if(toolIsActive) {
            selectTool(ToolType.portal);
        } else {selectTool(ToolType.none)}
    }

  return (
    <div className="terrain-tool-container" onClick={() => toggleActive()}>
        <div className={`brush-box ${toolIsActive ? 'outline' : ''}`}>
            <GiMagicPortal className="portal-icon"/>
        </div>
        <small className={`brush-name ${toolIsActive ? 'lightblue' : ''}`}>Portal</small>
    </div>
  )
}
