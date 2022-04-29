import { useEffect, useState } from "react";
import OverlayMenu from "./OverlayMenu";
import './Flip.css';
import Header from "./Header";
import { Navigate } from "react-router-dom";

function Flip(props) {
    const [isMenuActive, activeMenu] = useState(false);
    const [name, changeName] = useState(null);
    const [bet, changeBet] = useState(null);
    const [side, changeSide] = useState('Choose For Me');
    const [wallet, changeWallet] = useState("0x123abc");
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(false);
    let ready = false;

    if (name !== null && bet !== null) {
        ready = true;
    }

    async function joinGame() {
        let requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name: name, side: side, bet: bet, wallet: wallet})
        };
        fetch("/addPlayer", requestOptions)
            .then(result => result.json())
            .then(result => {
                if (result.result === "success") {
                    return fetch('/joinGame', requestOptions);
                }
                else if (result.result === "username taken") {
                    alert("username taken");
                    changeName(null);
                    setLoading(false);
                    return null;
                }
                else {
                    alert("an error happened");
                    changeName(null);
                    setLoading(false);
                    return null;
                }
            })
            .then(result => {
                if (!result) return null;
                return result.json();
            })
            .then(result => {
                if (!result) return null;
                let game = {
                    'p1': {'name': name, 'side': side, 'wallet': wallet},
                    'p2': {'name': result.name, 'side': result.side, 'wallet': result.wallet},
                    'bet': bet,
                    'winner': result.winner,
                    'gameID': result.gameID
                }
                setGame(game);
            })
            .catch(err => {
                console.log(err);
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
                        <button onClick={() => changeBet("1")} className={"betButton" + (bet === "1" ? "-selected" : "")}>1</button>
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
                        <button onClick={() => changeSide("Choose For Me")} className={"sideButton" + (side === "Choose For Me" ? "-selected" : "")}>Choose For Me</button>
                    </div>
                </div>
                <div className='flipRow' id="wallet">
                    <div className='flipRowText' id="walletText">Wallet:</div>
                    <div className='flipRowInput' id="walletInput">{wallet !== null ? wallet : "Connect Wallet"}</div>
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