import './terrainTool.css';

import {useState} from 'react';

import { TerrainType, TerrainTypeColors, ToolType } from '../../uiTypes';

interface TerrainToolInput {
    toolIsActive: boolean;
    setSelectedTool: Function;
    setSelectedBrush: Function;
} 

export default function TerrainTool({toolIsActive, setSelectedTool, setSelectedBrush}: TerrainToolInput) {
    //let [toolIsActive, setToolIsActive] = useState<boolean>(false);
    let [selectedTerrainType] = useState<TerrainType>(TerrainType.wall);

    const style = {backgroundColor: TerrainTypeColors[selectedTerrainType]};

    function toggleActive(): void {
        toolIsActive = !toolIsActive;
        if(toolIsActive) {
            setSelectedTool(ToolType.terrain);
            setSelectedBrush({name: "wall", color: "#303030"});
        } else {setSelectedTool(ToolType.none)}
        //setToolIsActive(toolIsActive);
    }

  return (
    <div className="terrain-tool-container" onClick={() => toggleActive()}>
        <div className={`brush-box ${toolIsActive ? 'outline' : ''}`} style={style}></div>
        <small className={`brush-name ${toolIsActive ? 'lightblue' : ''}`}>Wall</small>
    </div>
  )
}
