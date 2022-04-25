import CoinFlip from "./CoinFlip";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import coinReady from './coin-back-ready.svg';
import coinLoading from './coin-back-loading.svg';
import Player from './Player';
import './Game.css';
import Confetti from 'react-confetti';

/*

p1: load in. fetch(/addPlayer, gameData)
                .then(  () => fetch(/otherPlayerData, gameData)
                                .then(  res => res.json()   )
                                .then(  (result) => {
                                    if (result.name === null) {
                                        setTimeout();
                                    }
                                    else {
                                        fetch(/decideWinner, gameData);
                                    }
                                        }) )

*/

function Game() {
    const location = useLocation();
    const [gameData, changeGameData] = useState({
                                                'p1': {'name': location.state.player1Name, 'side': location.state.player1Side, 'wallet': location.state.player1Wallet}, 
                                                'p2': {'name': null, 'side': null, 'wallet': null}, 
                                                'bet': location.state.player1Bet,
                                                'winningSide': null,
                                                'gameID': null
                                                });
    const [gameFinished, setGameFinished] = useState(false);

    // useEffect(() => {
    //     const interval = setInterval(async () => {
    //         console.log(gameData);
    //         const requestOptions = {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({'gameID': gameData.gameID})
    //         };
    //         fetch('/updateTime', requestOptions).then(result => console.log("time updated"));
    //     }, 5000);
      
    //     return () => clearInterval(interval);
    // }, [gameData]);

    async function loadGame() {
        let requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"gameID": gameData.gameID})
        };
        let tempGameData = null;
        fetch('/otherPlayerData', requestOptions)
                .then(otherPlayerData => otherPlayerData.json())
                .then((otherPlayerData) => {
                    if (otherPlayerData.name === null) { // if no other player has joined recall this function in 3 seconds
                        setTimeout(loadGame, 3000);
                    }
                    else { // other player was found so begin game
                        setTimeout(() => {setGameFinished(true)}, 6000);
                        let requestOptions = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({'gameID': gameData.gameID})
                        };
                        fetch('/getWinner', requestOptions) // get winner returns the winner of the game
                            .then(winningSide => winningSide.json())
                            .then((winningSide) => {
                                tempGameData = {
                                    'p1': {'name': gameData.p1.name, 'side': gameData.p1.side, 'wallet': gameData.p1.wallet}, 
                                    'p2': {'name': otherPlayerData.name, 'side': otherPlayerData.side, 'wallet': otherPlayerData.wallet}, 
                                    'bet': gameData.bet,
                                    'winningSide': winningSide.side,
                                    'gameID': gameData.gameID
                                };
                            })
                            .then(() => {
                                fetch('/endGame', requestOptions); // end game removes the game from the servers database
                            })
                            .then(() => {
                                changeGameData(tempGameData);
                            })
                            .catch(err => {
                                console.log(err);
                                window.location.href = "/";
                            })
                        
                    }
                })
                .catch(err => {
                    console.log(err);
                    window.location.href = "/";
                })
    }

    useEffect(() => {
        if (gameData.gameID === null) {
            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({name: gameData.p1.name, side: gameData.p1.side, bet: gameData.bet, wallet: gameData.p1.wallet})
            };
            fetch('/addPlayer', requestOptions)
                .then(res => res.json())
                .then((otherPlayerData) => {
                    changeGameData({
                        'p1': {'name': gameData.p1.name, 'side': gameData.p1.side, 'wallet': gameData.p1.wallet}, 
                        'p2': {'name': otherPlayerData.name, 'side': otherPlayerData.side, 'wallet': otherPlayerData.wallet}, 
                        'bet': gameData.bet,
                        'winningSide': null,
                        'gameID': otherPlayerData.gameID
                    });
                })
                .catch(err => {
                    console.log(err);
                    window.location.href = "/";
                    return;
                });
        }
        else if (gameData.p2.name === null) { // this client is p1
            setTimeout(loadGame, 3000);
        }
        else if (gameData.winningSide === null){ // this client is p2
            setTimeout(() => {setGameFinished(true)}, 6000);
            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({'gameID': gameData.gameID})
            };
            fetch('/decideWinner', requestOptions) // decide winner initiates the money transfer and returns the winning side
                .then(winningSide => winningSide.json())
                .then((winningSide) => {
                    changeGameData({
                        'p1': {'name': gameData.p1.name, 'side': gameData.p1.side, 'wallet': gameData.p1.wallet}, 
                        'p2': {'name': gameData.p2.name, 'side': gameData.p2.side, 'wallet': gameData.p2.wallet}, 
                        'bet': gameData.bet,
                        'winningSide': winningSide.side,
                        'gameID': gameData.gameID
                    })
                })
                .catch(err => {
                    console.log(err);
                    window.location.href = "/";
                    return;
                });
        }
    }, [gameData]);
    
    return (
        <div id="Game">
            <div className="GamePrize">
                <div className="GamePrizeText">Cash Prize:</div>
                <div className="GamePrizeAmount">{gameData.bet * 2}</div>
            </div>
            <div id="GameMain">
                <Player name={gameData.p1.name} side={gameData.p1.side} result={gameFinished ? (gameData.winningSide === gameData.p1.side ? '-winner' : '') : ''}/>
                <CoinFlip animation={gameFinished ? 'done' : (gameData.winningSide === null ? 'loading' : 'ready')} winningSide={gameData.winningSide} image={gameData.winningSide === null ? coinLoading : coinReady}/>
                {gameData.winningSide === null ? <div style={{width: '300px', height: '150px'}}></div> : <Player name={gameData.p2.name} side={gameData.p2.side} wallet={gameData.p2.wallet} result={gameFinished ? (gameData.winningSide === gameData.p2.side ? '-winner' : '') : ''}/>}
            </div>
            {gameFinished ? <Confetti confettiSource={{ x: (gameData.winningSide === gameData.p1.side ? 0 : window.innerWidth - 300), y: 0, w: 300, h: 0 }}/> : null}
            {gameFinished ?  <div className="GameOverOptions">
                                    <a className="GameOverOption" href="/flip">Play Again</a>
                                    <a className="GameOverOption" href="/">Return to Home</a>
                                </div> 
                        : null
            }
        </div>
    );
}

export default Game;