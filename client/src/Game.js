import CoinFlip from "./CoinFlip";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import coinReady from './coin-back-ready.svg';
import coinLoading from './coin-back-loading.svg';
import Player from './Player';
import './Game.css';
import Confetti from 'react-confetti';
import { Navigate } from "react-router-dom";

function Game() {
    const location = useLocation();
    const [gameData, changeGameData] = useState(location.state ? location.state : null);
    const [gameFinished, setGameFinished] = useState(false);

    async function loadGame() {
        let requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({gameID: gameData.gameID})
        };
        fetch('/checkGameState', requestOptions)
            .then(result => result.json())
            .then(result => {
                if (result.name) {
                    changeGameData({
                        'p1': {'name': gameData.p1.name, 'side': gameData.p1.side, 'wallet': gameData.p1.wallet},
                        'p2': {'name': result.name, 'side': result.side, 'wallet': result.wallet},
                        'winner': result.winner,
                        'bet': gameData.bet,
                        'gameID': gameData.gameID
                    })
                }
                else if (result.error) {
                    console.log(result.error);
                    changeGameData(null); // this will cause the client to be navigated to home and the game be abandoned
                }
                else { // if player 2 not found (result.name = null) then poll again
                    setTimeout(loadGame, 3000); 
                }
            })
            .catch(err => { // this will cause the client to be navigated to home and the game be abandoned
                console.log(err);
                changeGameData(null);
            })
    }

    useEffect(() => {
        if (gameData === null) {
            return; // this is to not allow people onto this page if they haven't gone through the 'flip' page
        }
        else if (!gameData.winner) { 
            setTimeout(loadGame, 3000); // this client is p1, so schedule the polling for p2 to join
        }
        else if (gameData.winner) {
            setTimeout(() => {setGameFinished(true)}, 6000);
        }
    }, [gameData]);

    return (
        (gameData ?
        <div id="Game">
            <div className="GamePrize">
                <div className="GamePrizeText">Cash Prize:</div>
                <div className="GamePrizeAmount">{gameData.bet * 2}</div>
            </div>
            <div id="GameMain">
                <Player name={gameData.p1.name} side={gameData.p1.side} result={gameFinished ? (gameData.winner === gameData.p1.side ? '-winner' : '') : ''}/>
                <CoinFlip animation={gameFinished ? 'done' : (gameData.winner === null ? 'loading' : 'ready')} winningSide={gameData.winner} image={gameData.winner === null ? coinLoading : coinReady}/>
                {gameData.winner === null ? <div style={{width: '300px', height: '150px'}}></div> : <Player name={gameData.p2.name} side={gameData.p2.side} wallet={gameData.p2.wallet} result={gameFinished ? (gameData.winner === gameData.p2.side ? '-winner' : '') : ''}/>}
            </div>
            {gameFinished ? <Confetti confettiSource={{ x: (gameData.winner === gameData.p1.side ? 0 : window.innerWidth - 300), y: 0, w: 300, h: 0 }}/> : null}
            {gameFinished ?  <div className="GameOverOptions">
                                    <a className="GameOverOption" href="/flip">Play Again</a>
                                    <a className="GameOverOption" href="/">Return to Home</a>
                                </div> 
                        : null
            }
        </div>
        : <Navigate to="/" />)
    );
}

export default Game;