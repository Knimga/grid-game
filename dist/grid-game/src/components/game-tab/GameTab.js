"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./gameTab.css");
const BoardComponent_1 = __importDefault(require("./BoardComponent"));
function GameTab() {
    const placeholderBoard = {
        width: 10,
        height: 10,
        walls: [41, 42, 64, 65, 66, 67],
        chars: []
    };
    return (<div className="gametab-container">
            <div className="top-bar">

            </div>
            <div className="middle">
                <BoardComponent_1.default {...placeholderBoard}/>
            </div>
        </div>);
}
exports.default = GameTab;
//# sourceMappingURL=GameTab.js.map