import './talentTierPane.css';

import ActionPane from "./ActionPane";
import PassivePane from "./PassivePane";

import { FaTrashAlt } from "react-icons/fa";

import { levelsPerTalentTier } from "../../../services/charCalc";
import { randId } from '../../../services/detailStrings';

import { Talent, Passive, Action, Stats } from "../../../types/types";
import { ItemListType } from '../../../types/enums';

interface TalentTierBoxInput {
    tierIndex: number;
    talents: Talent[];
    selectedTalentId: string | null;
    stats: Stats | null;
    charLevel?: number;
    selectTalent?: Function;
    deleteTalent?: Function;
    selectTier?: Function;
    isSelected?: boolean;
    enableTalentList?: Function;
    onClick?: Function;
}

export default function TalentTierPane({
    tierIndex, talents, charLevel, selectedTalentId, stats, 
    selectTalent, deleteTalent, selectTier, isSelected, enableTalentList, onClick
}: TalentTierBoxInput) {
    const tierLevel: number = (tierIndex + 1) + (tierIndex * levelsPerTalentTier);
    const tierIsDisabled: boolean = charLevel ? tierLevel > charLevel : false;
    const isSelectedCss: string = isSelected ? 'talent-tier-selected' : '';

    function talentPane(talent: Talent, index: number): JSX.Element {
        if(talent.passive) return <div 
            className="talent-pane-container" 
            onClick={() => {if(talent.passive) clickOnTalent(talent.passive._id)}}
            key={randId()}
        >
            {passivePane(talent.passive)}
            {trashIcon(index)}
        </div>;
        if(talent.action) return <div 
            className="talent-pane-container"
            onClick={() => {if(talent.action) clickOnTalent(talent.action._id)}}
            key={randId()}
        >
            {actionPane(talent.action)}
            {trashIcon(index)}
        </div>;
        return <></>;
    }

    function passivePane(passive: Passive): JSX.Element {
        return <PassivePane 
            passive={passive} 
            isSelected={passive._id === selectedTalentId}
            key={passive._id}
        />
    }

    function actionPane(action: Action): JSX.Element {
        return <ActionPane 
            action={action}
            stats={stats}
            isSelected={action._id === selectedTalentId}
            onClick={() => clickOnTalent(action._id)}
            key={action._id}
        />
    }

    function trashIcon(index: number): JSX.Element {
        if(!deleteTalent) return <></>;
        return <FaTrashAlt className="clickable-icons" onClick={() => deleteTalent(tierIndex, index)}/>; 
    }

    function clickOnTier(): void {if(selectTier) selectTier(tierIndex)}

    function clickOnTalent(talentId: string): void {
        if(selectTalent && !tierIsDisabled) selectTalent(tierIndex, talentId)
    }

    function browseActions(): void {
        if(enableTalentList) enableTalentList(ItemListType.allAbilities)
    }

    function browsePassives(): void {
        if(enableTalentList) enableTalentList(ItemListType.allPassives)
    }

  return (
    <div className={`talent-tier-pane ${isSelectedCss}`}>
        <div className="talent-tier-header-column">
            <small 
                className="list-box-header talent-tier-box-header"
                onClick={() => clickOnTier()}
            >
                {`LEVEL ${tierLevel}`}
            </small>
            {enableTalentList && isSelected ? 
                <button onClick={() => browseActions()}>+ Action</button>
             : ''}
            {enableTalentList && isSelected ? 
                <button onClick={() => browsePassives()}>+ Passive</button>
             : ''}
        </div>
        <div className="talent-row">
            {talents.map((talent, index) => talentPane(talent, index))}
        </div>
    </div>
  )
}
