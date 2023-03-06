export enum CharType {
    enemy = 'enemy',
    player = 'player',
    beast = 'beast'
}

export enum ItemListType {
    weapons = 'weapons',
    abilities = 'abilities',
    armor = 'armor',
    passives = 'passives',
    allAbilities = 'allAbilities',
    allWeapons = 'allWeapons',
    allArmors = 'allArmors',
    allPassives = 'allPassives'
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
    melee = '#a9a9a9',
    ranged = '#c7c78d',
    magic = '#c1b4de',
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
    magic = '#60547a',
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

export enum TargetStatType {
    stat = 'stat',
    threat = 'threat',
    attribute = 'attribute',
    affinity = 'affinity'
}

export enum EffectTargetStat {
    hp = 'hp',
    hpRegen = 'hpRegen',
    mp = 'mp',
    mpRegen = 'mpRegen',
    ac = 'ac',
    mac = 'mac',
    mvt = 'mvt',
    initiative = 'initiative',
    threat = 'threat',
    strength = 'strength',
    finesse = 'finesse',
    toughness = 'toughness',
    mind = 'mind',
    spirit = 'spirit',
    bonusHealingDone = 'bonusHealingDone',
    bonusHealingRcvd = 'bonusHealingRcvd',
    threatMultiplier = 'threatMultiplier',
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
    fireAff = 'fireAff',
    windAtk = 'windAtk',
    windDmg = 'windDmg',
    windDr = 'windDr',
    windAff = 'windAff',
    earthAtk = 'earthAtk',
    earthDmg = 'earthDmg',
    earthDr = 'earthDr',
    earthAff = 'earthAff',
    shadowAtk = 'shadowAtk',
    shadowDmg = 'shadowDmg',
    shadowDr = 'shadowDr',
    shadowAff = 'shadowAff',
    waterAtk = 'waterAtk',
    waterDmg = 'waterDmg',
    waterDr = 'waterDr',
    waterAff = 'waterAff',
    holyAtk = 'holyAtk',
    holyDmg = 'holyDmg',
    holyDr = 'holyDr',
    holyAff = 'holyAff',
    poisonAtk = 'poisonAtk',
    poisonDmg = 'poisonDmg',
    poisonDr = 'poisonDr',
    poisonAff = 'poisonAff',
    lightningAtk = 'lightningAtk',
    lightningDmg = 'lightningDmg',
    lightningDr = 'lightningDr',
    lightningAff = 'lightningAff'
}

export enum WeaponType {
    simpleMelee = 'simpleMelee',
    simpleRanged = 'simpleRanged',
    martialMelee = 'martialMelee',
    martialRanged = 'martialRanged',
    magicalMelee = 'magicalMelee',
    magicalRanged = 'magicalRanged'
}

export enum ArmorType {
    cloth = 'cloth',
    light = 'light',
    medium = 'medium',
    heavy = 'heavy',
    shield = 'shield'
}