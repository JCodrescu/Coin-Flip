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
                                                'winningSide': null
                                                });
    const [gameFinished, setGameFinished] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({name: gameData.p1.name, side: gameData.p1.side, bet: gameData.bet, wallet: gameData.p1.wallet})
            };
            fetch('/updateTime', requestOptions);
        }, 10000);
      
        return () => clearInterval(interval);
    }, []);

    async function loadGame() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name: gameData.p1.name, side: gameData.p1.side, bet: gameData.bet, wallet: gameData.p1.wallet})
        };
        fetch('/otherPlayerData', requestOptions)
                .then(otherPlayerData => otherPlayerData.json())
                .then((otherPlayerData) => {
                    console.log(otherPlayerData);
                    if (otherPlayerData.name === null) { // if no other player has joined recall this function in 1 second
                        console.log("other player not found");
                        setTimeout(loadGame, 3000);
                    }
                    else { 
                        console.log("player found");
                        setTimeout(() => {setGameFinished(true)}, 6000);
                        let requestOptions = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({'p1': {name: gameData.p1.name, side: gameData.p1.side, wallet: gameData.p1.wallet}, 'p2': {name: otherPlayerData.name, side: otherPlayerData.side, wallet: otherPlayerData.wallet}, 'bet': gameData.bet})
                        };
                        fetch('/getWinner', requestOptions) // get winner returns the winner of the game
                            .then(winningSide => winningSide.json())
                            .then((winningSide) => {
                                changeGameData({
                                    'p1': {'name': gameData.p1.name, 'side': gameData.p1.side, 'wallet': gameData.p1.wallet}, 
                                    'p2': {'name': otherPlayerData.name, 'side': otherPlayerData.side, 'wallet': otherPlayerData.wallet}, 
                                    'bet': gameData.bet,
                                    'winningSide': winningSide.side
                                })
                            })
                            .then(() => {
                                fetch('/endGame', requestOptions); // end game removes the game from the servers database
                            })
                        
                    }
                })
    }

    useEffect(() => {
        async function startGame() {
            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({name: gameData.p1.name, side: gameData.p1.side, bet: gameData.bet, wallet: gameData.p1.wallet})
            };
            await fetch('/addPlayer', requestOptions)
                .then(res => res.json())
                .then((otherPlayerData) => {
                    if (otherPlayerData.name === null) { // if no other player has joined then this client is 'p1'
                        setTimeout(loadGame, 1000);
                    }
                    else { // if other player has joined then this client is 'p2'
                        setTimeout(() => {setGameFinished(true)}, 6000);
                        let requestOptions = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({'p1': {name: otherPlayerData.name, side: otherPlayerData.side, wallet: otherPlayerData.wallet}, 'p2': {name: gameData.p1.name, side: gameData.p1.side, wallet: gameData.p1.wallet}, 'bet': gameData.bet})
                        };
                        fetch('/decideWinner', requestOptions) // decide winner initiates the money transfer and returns the winning side
                            .then(winningSide => winningSide.json())
                            .then((winningSide) => {
                                changeGameData({
                                    'p1': {'name': gameData.p1.name, 'side': gameData.p1.side, 'wallet': gameData.p1.wallet}, 
                                    'p2': {'name': otherPlayerData.name, 'side': otherPlayerData.side, 'wallet': otherPlayerData.wallet}, 
                                    'bet': gameData.bet,
                                    'winningSide': winningSide.side
                                })
                            });
                    }
                })
        }
        startGame();
    }, [])

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