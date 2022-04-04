import { useState } from "react";
import OverlayMenu from "./OverlayMenu";
import PlayOptions from "./PlayOptions";
import StartHeader from "./StartHeader";
import './App.css';

function App() {
    const [isMenuActive, activeMenu] = useState(false);

    return (
    <div className="app">
        <StartHeader onMenuClick={() => activeMenu(!isMenuActive)}/>
        <PlayOptions />
        <OverlayMenu 
            isMenuActive={isMenuActive}
            closeMenu={() => activeMenu(false)} 
            />
    </div>
    )
}

export default App;