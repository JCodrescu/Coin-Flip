import { useState } from "react";
import OverlayMenu from "./OverlayMenu";
import './Flip.css';
import Header from "./Header";
import { Link } from "react-router-dom";

function Flip() {
    const [isMenuActive, activeMenu] = useState(false);
    const [name, changeName] = useState('');
    const [bet, changeBet] = useState('None');
    const [side, changeSide] = useState('Choose For Me');
    let ready = false;

    if (name !== '' && bet !== 'None') {
        ready = true;
    }

    return (
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
                    value={name}
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
                <div className='flipRowInput' id="walletInput">0x123456abcdef</div>
            </div>
            {ready ? 
                <Link state={{player1Name: name, player1Bet: bet, player1Side: (side === 'Choose For Me' ? (Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails') : side), player1Wallet: '0x123abc'}} id="readyLink" to="/game"><button className="flipRow" id={"readyButton" + (ready ? '-ready' : '')}>Ready</button></Link>
                :
                <button id={"readyButton" + (ready ? '-ready' : '')}>Ready</button> 
            }
        </div>
    </div>
    )
}

export default Flip;