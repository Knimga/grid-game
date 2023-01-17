import * as React from 'react';
import './App.css';

import Typography from '@mui/material/Typography';
import {Box, Tabs, Tab } from '@mui/material';

import DungeonsTab from './components/dungeons/DungeonsTab';
import GameController from './components/game-tab/GameController';
import CharactersTab from './components/characters/CharactersTab';
import ClassTab from './components/classes/ClassTab';
import ActionsTab from './components/actions/ActionsTab';
import PartiesTab from './components/parties/PartiesTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}`};
}

function App() {
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value} onChange={handleChange} aria-label="basic tabs example"
          sx={{
            '& .MuiTab-textColorPrimary': {color: 'lightgray'},
            '& .MuiTabs-indicator': {backgroundColor: 'lightgray'},
            '& .Mui-selected': {color: 'yellow'}
          }}
        >
          <Tab label="Game" {...a11yProps(0)} />
          <Tab label="Dungeons" {...a11yProps(1)} />
          <Tab label="Characters" {...a11yProps(2)} />
          <Tab label="Parties" {...a11yProps(3)} />
          <Tab label="Classes" {...a11yProps(4)} />
          <Tab label="Actions" {...a11yProps(5)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <GameController />
      </TabPanel>
      <TabPanel value={value} index={1}>
      <DungeonsTab />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <CharactersTab />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <PartiesTab />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <ClassTab />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <ActionsTab />
      </TabPanel>
      
    </Box>
  );
}

export default App;
