import './weaponsArmorTab.css';

import { useState, useEffect } from "react";

import WeaponSection from './WeaponSection';
import ArmorSection from './ArmorSection';

import urls from '../../urls';

import { Weapon, Armor } from '../../types/types';

export default function WeaponsArmorTab() {
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [armors, setArmors] = useState<Armor[]>([]);

    useEffect(() => {
        fetch(urls.localRoot+urls.weapons.getAll)
            .then(res => res.json())
            .then((weapons) => {
                setWeapons(weapons.sort((a: Weapon, b: Weapon) => a.name > b.name ? 1 : -1));
            }).catch((err) => console.log(err));
        fetch(urls.localRoot+urls.armors.getAll)
            .then(res => res.json())
            .then((armors) => {
                setArmors(armors.sort((a: Armor, b: Armor) => a.name > b.name ? 1 : -1));
            }).catch((err) => console.log(err));
    },[]);

  return (
    <div className="tab-container">
        <div className="weapons-armor-container">
            {weapons.length ? <WeaponSection weapons={weapons} setWeapons={setWeapons} /> : ''}
            {armors.length ? <ArmorSection armors={armors} setArmors={setArmors} /> : ''}
        </div>
    </div>
  )
}
