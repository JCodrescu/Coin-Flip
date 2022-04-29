import App from './App';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Flip from './Flip';
import Game from './Game';

function Router() {
    return (
        <BrowserRouter className="PlayOptions">
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="flip" element={<Flip />} />
                <Route path="create" element={<Navigate to="/" />} />
                <Route path="join" element={<Navigate to="/" />} />
                <Route path="game" element={<Game />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;