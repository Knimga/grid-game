import './mainMenu.css';

import { Link } from 'react-router-dom';

import {Button} from '@mui/material';

export default function MainMenu() {

  return (
    <div className="app-container main-menu-container">
        <div className="game-menu-container">
            <div className="game-menu-main-button-row">
                <Button variant="contained">
                    <Link to="/newGame" className="link-text">+ New Game</Link>
                </Button>
                <Button variant="contained" disabled={true}>Continue</Button>
            </div>
        </div>
    </div>
  )
}
