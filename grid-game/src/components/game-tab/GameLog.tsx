import './gameLog.css';

import { randId } from '../../services/detailStrings';

import {TurnLog} from '../../uiTypes';

interface GameLogInput {logs: TurnLog[]}

export default function GameLog({logs}: GameLogInput) {

    function logElement(log: TurnLog, index: number): JSX.Element {
        return <div className={`log-list-item ${index % 2 ? '' : 'light-background'}`} key={randId()}>
            <div className="log-item-header">{log.header}</div>
            {log.actions.map(text => {
                return <div className="log-item" key={randId()}>
                    <div className="log-item-padding">{text}</div>
                </div>
            })}
        </div>
    }

  return (
    <div className="game-log">
        <strong>Game Log</strong>
        <div className="log-list">
            {logs.map((log, index) => logElement(log, index))}
        </div>
    </div>
  )
}
