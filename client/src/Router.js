import React from 'react';
import App from './App';
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Hamburger from './Hamburger';
import Flip from './Flip';
import Game from './Game';

function Router() {
    return (
        <BrowserRouter className="PlayOptions">
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="flip" element={<Flip />} />
                <Route path="create" element={<Hamburger />} />
                <Route path="join" element={<Hamburger />} />
                <Route path="game" element={<Game />} />
            </Routes>
        </BrowserRouter>    
    );
}

export default Router;