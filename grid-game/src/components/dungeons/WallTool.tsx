import './wallTool.css';

import { ToolType } from '../../types/uiTypes';

interface WallToolInput {
    toolIsActive: boolean;
    selectTool: Function;
    wallColor: string;
} 

export default function WallTool({toolIsActive, selectTool, wallColor}: WallToolInput) {

    function toggleActive(): void {
        toolIsActive = !toolIsActive;
        selectTool(toolIsActive ? ToolType.wall : ToolType.none); 
    }

  return (
    <div className="wall-tool-container" onClick={() => toggleActive()}>
        <div className={`brush-box ${toolIsActive ? 'outline' : ''}`} style={{backgroundColor: wallColor}}></div>
        <small className={`brush-name ${toolIsActive ? 'lightblue' : ''}`}>Wall</small>
    </div>
  )
}
