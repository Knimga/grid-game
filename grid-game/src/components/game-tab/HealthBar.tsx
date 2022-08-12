interface HealthBarInput {
    currentHp: number,
    totalHp: number,
    currentMp: number,
    totalMp: number
}

export default function HealthBar({currentHp, totalHp, currentMp, totalMp}: HealthBarInput) {
    const hpBarStyle = {width: `${(currentHp / totalHp) * 100}%`}
    const mpBarStyle = {width: `${(currentMp / totalMp) * 100}%`}

  return (
    <div className="charbar-container">
        <div className="hpbar" style={hpBarStyle}></div>
        <div className="mpbar" style={mpBarStyle}></div>
    </div>
  )
}
