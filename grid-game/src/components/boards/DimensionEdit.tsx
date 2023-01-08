import './dimensionEdit.css';

import {useState} from 'react';

import { FaPen } from 'react-icons/fa';

import NumStepper from '../shared/NumStepper';

interface DimensionEditInput {
    width: number,
    height: number,
    updateSize: Function
}

export default function DimensionEdit({width, height, updateSize}: DimensionEditInput) {
    let [editModeOn, setEditModeOn] = useState<boolean>(false);

    function toggleEdit(): void {setEditModeOn(!editModeOn)}

    function updateWidth(newWidth: number): void {updateSize(newWidth, height)}
    function updateHeight(newHeight: number): void {updateSize(width, newHeight)}

  return (
    <div className="dimension-edit-container">
        <div className="dimension-edit-row">
            <small className="dimension-warning">Editing this clears the map!</small>
            <FaPen className="dimension-edit-button" onClick={() => toggleEdit()} />
        </div>
        
        <div className="dimension-edit-row">
            <small className="dimension-label">Width:</small>
            <div className="dimension-value">
                {
                    editModeOn ? 
                        <NumStepper number={width} min={5} max={25} update={updateWidth} />
                    : <span>{width}</span>
                }
            </div>
        </div>
        <div className="dimension-edit-row">
            <small className="dimension-label">Height:</small>
            <div className="dimension-value">
                {
                    editModeOn ? 
                        <NumStepper number={height} min={5} max={25} update={updateHeight} />
                    : <span>{height}</span>
                }
            </div>
        </div>
    </div>
  )
}
