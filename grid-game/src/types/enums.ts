export enum CharType {
    enemy = 'enemy',
    player = 'player',
    beast = 'beast'
}

export enum ItemListType {
    weapons = 'weapons',
    abilities = 'abilities',
    armor = 'armor',
    allAbilities = 'allAbilities',
    allWeapons = 'allWeapons',
    allArmors = 'allArmors'
}

export enum AttributeEnum {
    strength = 'strength',
    finesse = 'finesse',
    toughness = 'toughness',
    mind = 'mind',
    spirit = 'spirit'
}

export enum ClassRole {
    melee = 'melee',
    ranged = 'ranged',
    magic = 'magic',
    support = 'support'
}

export enum ElementType {
    fire = 'fire',
    wind = 'wind',
    earth = 'earth',
    shadow = 'shadow',
    water = 'water'
}

export enum DamageType {
    melee = 'melee',
    ranged = 'ranged',
    magic = 'magic',
    fire = 'fire',
    wind = 'wind',
    earth = 'earth',
    shadow = 'shadow',
    water = 'water',
    holy = 'holy',
    poison = 'poison',
    lightning = 'lightning'
}

export enum DamageTypeColor {
    melee = '#c2c2c2',
    ranged = '#c7c78d',
    magic = '#a9d9d9',
    fire = 'firebrick',
    wind = 'lightblue',
    earth = 'darkgoldenrod',
    shadow = 'purple',
    water = 'dodgerblue',
    holy = 'gold',
    poison = 'olivedrab',
    lightning = 'darkturquoise'
}

export enum DamageTypeDarkColor {
    melee = '#202020',
    ranged = '#202020',
    magic = 'darkslategray',
    fire = '#300300',
    wind = '#165e80',
    earth = '#261e03',
    shadow = '#21072b',
    water = '#05123d',
    holy = '#474701',
    poison = '#021f00',
    lightning = '#007173'
}

export enum Intent {
    offense = 'offense',
    defense = 'defense'
}

export enum TargetingType {
    single = 'single',
    burst = 'burst',
    line = 'line',
    self = 'self'
}

export enum EffectType {
    healing = 'healing',
    buff = 'buff',
    debuff = 'debuff',
    damage = 'damage',
    hot = 'hot',
    dot = 'dot',
    threat = 'threat'
}

export enum EffectTargetStat {
    hp = 'hp',
    hpRegen = 'hpRegen',
    mp = 'mp',
    mpRegen = 'mpRegen',
    ac = 'ac',
    mac = 'mac',
    mvt = 'mvt',
    bonusHealingDone = 'bonusHealingDone',
    bonusHealingRcvd = 'bonusHealingRcvd',
    threatMuliplier = 'threatMultiplier',
    allAtkRolls = 'allAtkRolls',
    allDmgRolls = 'allDmgRolls',
    allDr = 'allDr',
    meleeAtk = 'meleeAtk',
    meleeDmg = 'meleeDmg',
    meleeDr = 'meleeDr',
    rangedAtk = 'rangedAtk',
    rangedDmg = 'rangedDmg',
    rangedDr = 'rangedDr',
    magicAtk = 'magicAtk',
    magicDmg = 'magicDmg',
    magicDr = 'magicDr',
    fireAtk = 'fireAtk',
    fireDmg = 'fireDmg',
    fireDr = 'fireDr',
    windAtk = 'windAtk',
    windDmg = 'windDmg',
    windDr = 'windDr',
    earthAtk = 'earthAtk',
    earthDmg = 'earthDmg',
    earthDr = 'earthDr',
    shadowAtk = 'shadowAtk',
    shadowDmg = 'shadowDmg',
    shadowDr = 'shadowDr',
    waterAtk = 'waterAtk',
    waterDmg = 'waterDmg',
    waterDr = 'waterDr',
    holyAtk = 'holyAtk',
    holyDmg = 'holyDmg',
    holyDr = 'holyDr',
    poisonAtk = 'poisonAtk',
    poisonDmg = 'poisonDmg',
    poisonDr = 'poisonDr'
}
