import { blankBoard } from "./boards";

import { Dungeon } from "../types/types";

export function blankDungeon(): Dungeon {
    return {
        name: 'New dungeon',
        floorColor: '#252b57',
        wallColor: '#202020',
        boards: [blankBoard(15, 15)]
    }
}

