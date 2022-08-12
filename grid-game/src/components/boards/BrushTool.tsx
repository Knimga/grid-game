import './BrushTool.css';

import {useState} from 'react';

import { TerrainType, TerrainTypeColors, ToolType } from '../../uiTypes';

interface BrushToolInput {
    brushes: any[];
    toolType: ToolType;
    setSelectedTool: Function;
    setSelectedBrush: Function;
}

/*
tooltype = terrain or char
*/

export default function BrushTool({brushes, toolType, setSelectedTool, setSelectedBrush}: BrushToolInput) {
    let [toolIsActive, setToolIsActive] = useState<boolean>(false);
    let [selectedBrush] = useState<TerrainType>(TerrainType.wall);

    const style = {backgroundColor: TerrainTypeColors[selectedBrush]};

    function toggleActive(): void {
        toolIsActive = !toolIsActive;
        if(toolIsActive) {
            setSelectedTool(ToolType.terrain);
            setSelectedBrush(selectedBrush);
        } else {setSelectedTool(ToolType.none)}
        setToolIsActive(toolIsActive);
    }

  return (
    <div className="brush-tool-container" onClick={() => toggleActive()}>
        <div className={`brush-box ${toolIsActive ? 'outline' : ''}`} style={style}></div>
        <small className={`brush-name ${toolIsActive ? 'lightblue' : ''}`}>Wall</small>
    </div>
  )
}
