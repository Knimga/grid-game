import './affinityBox.css';

import { Affinities, DamageTypeColor, DamageTypeDarkColor } from '../../types';

import { cap } from '../../services/detailStrings';

interface AffinityBoxInput {
    element: keyof Affinities,
    value: number
}

export default function AffinityBox({element, value}: AffinityBoxInput) {
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
            <small>{value}</small>
        </div>
        <div className="affinity-box-row" style={darkOnLight}>
            <small>{cap(element)}</small>
        </div>
    </div>

}
