import { useEffect, useState } from "react";
import OverlayMenu from "./OverlayMenu";
import './Flip.css';
import Header from "./Header";
import { Navigate } from "react-router-dom";

function Flip() {
    const [isMenuActive, activeMenu] = useState(false);
    const [name, changeName] = useState(null);
    const [bet, changeBet] = useState("None");
    const [side, changeSide] = useState('Choose For Me');
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(false);
    let ready = false;

    if (name !== null) {
        ready = true;
    }

    async function joinGame() {
        let requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name: name, side: side, bet: bet})
        };
        fetch('/joinGame', requestOptions)
            .then(result => result.json())
            .then(result => {
                let game = {
                    'p1': {'name': name, 'side': result.givenSide},
                    'p2': {'name': result.name, 'side': result.side},
                    'bet': bet,
                    'winner': result.winner,
                    'gameID': result.gameID
                }
                setGame(game);
            })
            .catch(err => {
                console.log(err);
                console.log("didnt work")
            });
    }

    useEffect(() => {
        if (loading) {
            joinGame();
        }
    }, [loading]);

    return (
        !game ?
        <div>
            <Header onMenuClick={() => activeMenu(!isMenuActive)}/>
            <OverlayMenu 
                isMenuActive={isMenuActive}
                closeMenu={() => activeMenu(false)} 
            />
            <div className="flip">
                <div className='flipRow' id="screenName">
                    <div className='flipRowText' id="screenNameText">Screen Name:</div>
                    <input className='flipRowInput' id="screenNameInput"
                        type="text"
                        placeholder="Input Screen Name"
                        value={name !== null ? name : ''}
                        onChange={(event) => {changeName(event.target.value)}}
                    />
                </div>
                <div className='flipRow' id="bet">
                    <div className='flipRowText' id="betText">Bet Amount:</div>
                    <div className='flipRowInput' id="betInput">
                            <button onClick={() => changeBet("None")} className={"betButton" + (bet === "None" ? "-selected" : "")}>None</button>
                            <button onClick={() => changeBet("5")} className={"betButton" + (bet === "5" ? "-selected" : "")}>5</button>
                            <button onClick={() => changeBet("10")} className={"betButton" + (bet === "10" ? "-selected" : "")}>10</button>
                            <button onClick={() => changeBet("25")} className={"betButton" + (bet === "25" ? "-selected" : "")}>25</button>
                            <button onClick={() => changeBet("50")} className={"betButton" + (bet === "50" ? "-selected" : "")}>50</button>
                    </div>
                </div>
                <div className='flipRow' id="side">
                    <div className='flipRowText' id="sideText">Side:</div>
                    <div className='flipRowInput' id="sideInput">
                        <button onClick={() => changeSide("Heads")} className={"sideButton" + (side === "Heads" ? "-selected" : "")}>Heads</button>
                        <button onClick={() => changeSide("Tails")} className={"sideButton" + (side === "Tails" ? "-selected" : "")}>Tails</button>
                        <button onClick={() => changeSide("Choose For Me")} className={"sideButton" + (side === "Choose For Me" ? "-selected" : "")}>Random</button>
                    </div>
                </div>
                {ready ?  
                    <button onClick={() => {setLoading(true)}} className="flipRow" id={"readyButton" + (ready ? '-ready' : '')}>Ready</button>
                    :
                    <button id={"readyButton" + (ready ? '-ready' : '')}>Ready</button> 
                }
                {loading ?
                    <div>loading</div>
                    :
                    null
                }
            </div>
        </div>
        : <Navigate state={game} id="readyLink" to="/game" />
    )
}

export default Flip;