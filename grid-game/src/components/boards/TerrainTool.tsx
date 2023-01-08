import './terrainTool.css';

import {useState} from 'react';

import { TerrainType, TerrainTypeColors, ToolType } from '../../uiTypes';

interface TerrainToolInput {
    toolIsActive: boolean;
    selectTool: Function;
    setSelectedBrush: Function;
} 

export default function TerrainTool({toolIsActive, selectTool, setSelectedBrush}: TerrainToolInput) {
    let [selectedTerrainType] = useState<TerrainType>(TerrainType.wall);

    const style = {backgroundColor: TerrainTypeColors[selectedTerrainType]};

    function toggleActive(): void {
        toolIsActive = !toolIsActive;
        if(toolIsActive) {
            selectTool(ToolType.wall);
            setSelectedBrush({name: "wall", color: "#303030"});
        } else {selectTool(ToolType.none)}
    }

  return (
    <div className="terrain-tool-container" onClick={() => toggleActive()}>
        <div className={`brush-box ${toolIsActive ? 'outline' : ''}`} style={style}></div>
        <small className={`brush-name ${toolIsActive ? 'lightblue' : ''}`}>Wall</small>
    </div>
  )
}
