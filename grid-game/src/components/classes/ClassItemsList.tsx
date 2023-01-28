import ActionPane from "../shared/ActionPane";
import ArmorPane from "../shared/ArmorPane";

import { FaTrashAlt } from "react-icons/fa";
import { BsPlusCircle } from "react-icons/bs";

import { allCaps } from "../../services/detailStrings";

import { Action, Armor } from "../../types/types";
import { ItemListType } from "../../types/enums";

interface ClassItemsListInput {
    itemType: ItemListType;
    actions: Action[];
    armors: Armor[];
    itemFunctions: any;
}

export default function ClassItemsList({itemType, actions, armors, itemFunctions}: ClassItemsListInput) {
    const sortedActions: Action[] = actions.sort((a,b) => a.name < b.name ? -1 : 1);
    const sortedArmors: Armor[] = armors.sort((a,b) => a.name < b.name ? -1 : 1);

    function listHeaderString(): string {
        if(itemType === ItemListType.allAbilities) return 'ADD ABILITIES';
        if(itemType === ItemListType.allWeapons) return 'ADD WEAPONS';
        if(itemType === ItemListType.allArmors) return 'ADD ARMORS';
        return allCaps(itemType);
    }

    function itemPanes(): JSX.Element {
        switch(itemType) {
            case 'weapons': return <div>
                {sortedActions.filter(a => a.isWeapon).map(weapon => equippedActionPane(weapon))}
            </div>
            case 'abilities': return <div>
                {sortedActions.filter(a => !a.isWeapon).map(weapon => equippedActionPane(weapon))}
            </div>
            case 'armor': return <div>
                {sortedArmors.map(armor => equippedArmorPane(armor))}
            </div>
            case 'allAbilities': return <div>
                {sortedActions.map(weapon => unequippedActionPane(weapon))}
            </div>
            case 'allWeapons': return <div>
                {sortedActions.filter(a => a.isWeapon).map(weapon => unequippedActionPane(weapon))}
            </div>
            case 'allArmors': return <div>
                {sortedArmors.map(armor => unequippedArmorPane(armor))}
            </div>

            default: return <></>
        }
    }

    function equippedActionPane(action: Action): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            <ActionPane action={action} stats={null} />
            <FaTrashAlt 
                className="clickable-icons" 
                onClick={() => itemFunctions.removeAction(action._id)} 
            />
        </div>
    }

    function unequippedActionPane(action: Action): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            <BsPlusCircle 
                className="clickable-icons"
                onClick={() => itemFunctions.addAction(action)}
            />
            <ActionPane action={action} stats={null} />
        </div>
    }

    function equippedArmorPane(armor: Armor): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            <ArmorPane armor={armor} />
            <FaTrashAlt 
                className="clickable-icons" 
                onClick={() => itemFunctions.removeArmor(armor._id)} 
            />
        </div>
    }

    function unequippedArmorPane(armor: Armor): JSX.Element {
        return <div className="class-builder-list-box-row" key={Math.random()}>
            <BsPlusCircle 
                className="clickable-icons"
                onClick={() => itemFunctions.addArmor(armor)}
            />
            <ArmorPane armor={armor} />
        </div>
    }

  return (
    <div className="class-builder-list-box">
        <small className="list-box-header">{listHeaderString()}</small>
        {itemPanes()}
    </div>
  )
}
