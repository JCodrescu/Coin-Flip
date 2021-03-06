import { useState, useEffect } from "react";
import OverlayMenu from "./OverlayMenu";
import PlayOptions from "./PlayOptions";
import Header from "./Header";
import WaitingPlayers from "./WaitingPlayers";
import './App.css';

function App() {
    const [isMenuActive, activeMenu] = useState(false);
    
    return (
    <div className="app">
        <Header onMenuClick={() => activeMenu(!isMenuActive)}/>
        <div className='AppBody'>
            <WaitingPlayers className="WaitingPlayers"/>
            <PlayOptions/>
            <div className="AppEmptyDiv"></div>
        </div>
        <OverlayMenu 
            isMenuActive={isMenuActive}
            closeMenu={() => activeMenu(false)} 
            />
    </div>
    )
}

export default App;