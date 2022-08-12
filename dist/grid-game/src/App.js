"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
require("./App.css");
const Typography_1 = __importDefault(require("@mui/material/Typography"));
const Box_1 = __importDefault(require("@mui/material/Box"));
const Tabs_1 = __importDefault(require("@mui/material/Tabs"));
const Tab_1 = __importDefault(require("@mui/material/Tab"));
const GameTab_1 = __importDefault(require("./components/game-tab/GameTab"));
function TabPanel(props) {
    const { children, value, index } = props, other = __rest(props, ["children", "value", "index"]);
    return (<div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && (<Box_1.default sx={{ p: 3 }}>
          <Typography_1.default>{children}</Typography_1.default>
        </Box_1.default>)}
    </div>);
}
function a11yProps(index) {
    return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}` };
}
function App() {
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (<Box_1.default sx={{ width: '100%' }}>
      <Box_1.default sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs_1.default value={value} onChange={handleChange} aria-label="basic tabs example" sx={{
            '& .MuiTab-textColorPrimary': { color: 'lightgray' },
            '& .MuiTabs-indicator': { backgroundColor: 'lightgray' },
            '& .Mui-selected': { color: 'yellow' }
        }}>
          <Tab_1.default label="Game" {...a11yProps(0)}/>
          <Tab_1.default label="Boards" {...a11yProps(1)}/>
          <Tab_1.default label="Characters" {...a11yProps(2)}/>
        </Tabs_1.default>
      </Box_1.default>
      <TabPanel value={value} index={0}>
        <GameTab_1.default />
      </TabPanel>
      <TabPanel value={value} index={1}>
        Boards
      </TabPanel>
      <TabPanel value={value} index={2}>
        Characters
      </TabPanel>
    </Box_1.default>);
}
exports.default = App;
//# sourceMappingURL=App.js.map