"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// for now, always 10x10
require("./board.css");
const types_1 = require("../../types");
function BoardComponent(board) {
    const grid = [];
    const gridLength = board.width * board.height;
    for (let i = 0; i < gridLength; i++)
        grid[i] = { type: types_1.SquareType.empty };
    if (boardIsValid())
        createBoard();
    function boardIsValid() {
        const validWallIndices = board.walls.every(w => w < gridLength && w >= 0);
        const validCharIndices = board.chars.every(char => char.index < gridLength && char.index >= 0);
        const noCharsInWalls = board.chars.every(char => !board.walls.includes(char.index));
        return validWallIndices && validCharIndices && noCharsInWalls;
    }
    function createBoard() {
        board.walls.forEach(w => grid[w].type = types_1.SquareType.wall);
        // get chars from db, place them onto Square.char of the right index
    }
    return (<div className="board">
            {grid.map(squ => <div className={`square ${squ.type}`}></div>)}

        </div>);
}
exports.default = BoardComponent;
//# sourceMappingURL=BoardComponent.js.map