import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainMenu from './components/mainMenu/MainMenu';
import Admin from './components/admin/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/newGame" element={<div>omg</div>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
