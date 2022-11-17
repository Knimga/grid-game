
import { Affinities, DamageType, DamageTypeColor, DamageTypeDarkColor } from '../../types';

import { cap } from '../../services/detailStrings';

interface AffinityStatsInput {affinities: Affinities}

export default function AffinityStats({affinities}: AffinityStatsInput) {
    const primaryElements: (keyof Affinities)[] = ['fire','wind','earth','shadow','water'];
    const secondaryElements: (keyof Affinities)[] = ['holy','poison'];

    function affinityBox(element: keyof Affinities): JSX.Element {
        const lightOnDark: Object = {
            color: DamageTypeColor[element],
            backgroundColor: DamageTypeDarkColor[element]
        }
        const darkOnLight: Object = {
            color: DamageTypeDarkColor[element],
            backgroundColor: DamageTypeColor[element]

        }
        return <div className="affinity-box" key={Math.random()}>
            <div className="affinity-box-row" style={lightOnDark}>
                <small>{affinities[element]}</small>
            </div>
            <div className="affinity-box-row" style={darkOnLight}>
                <small>{cap(element)}</small>
            </div>
        </div>
    }

  return (
    <div className="affinity-container">
        <div className="affinity-row">
            {primaryElements.map(ele => affinityBox(ele))}
        </div>
        <div className="affinity-row">
            {secondaryElements.map(ele => affinityBox(ele))}
        </div>
    </div>
  )
}
