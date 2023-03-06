import ActionPane from "../shared/panes/ActionPane";
import ArmorPane from "../shared/panes/ArmorPane";
import WeaponPane from "../shared/panes/WeaponPane";
import PassivePane from "../shared/panes/PassivePane";

import { FaTrashAlt } from "react-icons/fa";
import { BsPlusCircle } from "react-icons/bs";

import { Action, Armor, Weapon, Passive } from "../../types/types";
import { ItemListType } from "../../types/enums";

interface ClassItemsListInput {
    itemType: ItemListType;
    actions: Action[];
    armors: Armor[];
    weapons: Weapon[];
    passives: Passive[];
    onClick?: Function;
    itemFunctions: any;
    isRow?: boolean;
}

export default function ClassItemsList(
    {itemType, actions, armors, weapons, passives, onClick, isRow, itemFunctions}: ClassItemsListInput
) {
    const itemsAreEquipped: boolean = [
        ItemListType.abilities, ItemListType.armor, ItemListType.weapons, ItemListType.passives
    ].includes(itemType);

    const sortedActions: Action[] = actions.sort((a,b) => a.name < b.name ? -1 : 1);
    const sortedArmors: Armor[] = armors.sort((a,b) => a.name < b.name ? -1 : 1);
    const sortedWeapons: Weapon[] = weapons.sort((a,b) => a.name < b.name ? -1 : 1);
    const sortedPassives: Passive[] = passives.sort((a,b) => a.name < b.name ? -1 : 1);

    function listHeaderString(): string {
        switch(itemType) {
            case ItemListType.allAbilities: return 'ADD ABILITIES';
            case ItemListType.allWeapons: return 'ADD WEAPONS';
            case ItemListType.allArmors: return 'ADD ARMOR';
            case ItemListType.allPassives: return 'ADD PASSIVES';
            case ItemListType.weapons: return 'STARTING WEAPONS';
            case ItemListType.armor: return 'STARTING ARMOR';
            case ItemListType.abilities: return 'STARTING ABILITIES';
            case ItemListType.passives: return 'PASSIVES';
            default: return '?';
        }
    }

    function itemPanes(): JSX.Element {
        switch(itemType) {
            case 'weapons': if(!sortedWeapons.length) return none();
                return list(sortedWeapons.map(weapon => weaponPane(weapon)));
            case 'abilities': if(!sortedActions.length) return none();
                return list(sortedActions.map(weapon => actionPane(weapon)));
            case 'armor': if(!sortedArmors.length) return none();
                return list(sortedArmors.map(armor => armorPane(armor)));
            case 'passives': if(!sortedPassives.length) return none();
                return list(sortedPassives.map(passive => passivePane(passive)));
            case 'allAbilities': return list(sortedActions.map(weapon => actionPane(weapon)));
            case 'allWeapons': return list(sortedWeapons.map(weapon => weaponPane(weapon)));
            case 'allArmors': return list(sortedArmors.map(armor => armorPane(armor)));
            case 'allPassives': return list(sortedPassives.map(passive => passivePane(passive)));
            default: return <></>;
        }
    }

    function none(): JSX.Element {return <small className="gray">None</small>}

    function list(items: JSX.Element[]): JSX.Element {
        return <div className={`${isRow ? 'inner-list-box-row' : ''}`}>{items}</div>
    }

    function addIcon(clickFunction: Function, functionArg: any): JSX.Element {
        if(itemsAreEquipped) return <></>;
        return <BsPlusCircle className="clickable-icons" onClick={() => clickFunction(functionArg)}/>;
    }

    function trashIcon(clickFunction: Function, functionArg: any): JSX.Element {
        if(!itemsAreEquipped) return <></>;
        return <FaTrashAlt className="clickable-icons" onClick={() => clickFunction(functionArg)}/>; 
    }

    function actionPane(action: Action): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            {addIcon(itemFunctions.addAction, action)}
            <ActionPane action={action} stats={null} key={action._id} />
            {trashIcon(itemFunctions.removeAction, action._id)}
        </div>
    }

    function armorPane(armor: Armor): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            {addIcon(itemFunctions.addArmor, armor)}
            <ArmorPane armor={armor} key={armor._id} />
            {trashIcon(itemFunctions.removeArmor, armor._id)}
        </div>
    }

    function weaponPane(weapon: Weapon): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            {addIcon(itemFunctions.addWeapon, weapon)}
            <WeaponPane weapon={weapon} stats={null} key={weapon._id} />
            {trashIcon(itemFunctions.removeWeapon, weapon._id)}
        </div>
    }

    function passivePane(passive: Passive): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            {addIcon(itemFunctions.addPassive, passive)}
            <PassivePane passive={passive} key={passive._id} />
            {trashIcon(itemFunctions.removePassive, passive._id)}
        </div>
    }

    function click() {if(onClick) onClick()}

  return (
    <div 
        className={`class-builder-list-box ${isRow ? 'list-box-row' : 'list-box-column'}`} 
        onClick={() => click()}
    >
        <small className="list-box-header">{listHeaderString()}</small>
        {itemPanes()}
    </div>
  )
}
