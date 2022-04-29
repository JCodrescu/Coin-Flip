import CoinFlip from "./CoinFlip";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import coinReady from './coin-back-ready.svg';
import coinLoading from './coin-back-loading.svg';
import Player from './Player';
import './Game.css';
import Confetti from 'react-confetti';
import { Navigate } from "react-router-dom";

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
    const [gameData, changeGameData] = useState(location.state !== null ? {
                                                    'p1': {'name': location.state.name, 'side': location.state.side, 'wallet': location.state.wallet}, 
                                                    'p2': {'name': null, 'side': null, 'wallet': null}, 
                                                    'bet': location.state.bet,
                                                    'winningSide': null,
                                                    'gameID': null
                                                    }
                                                    : null
                                                );
    const [gameFinished, setGameFinished] = useState(false);

    async function loadGame() {
        console.log("loading...")
    }

    // async function loadGame() {
    //     let requestOptions = {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({"gameID": gameData.gameID})
    //     };
    //     let tempGameData = null;
    //     fetch('/otherPlayerData', requestOptions)
    //             .then(otherPlayerData => otherPlayerData.json())
    //             .then((otherPlayerData) => {
    //                 if (otherPlayerData.name === null) { // if no other player has joined recall this function in 3 seconds
    //                     setTimeout(loadGame, 3000);
    //                 }
    //                 else { // other player was found so begin game
    //                     setTimeout(() => {setGameFinished(true)}, 6000);
    //                     let requestOptions = {
    //                         method: 'POST',
    //                         headers: { 'Content-Type': 'application/json' },
    //                         body: JSON.stringify({'gameID': gameData.gameID})
    //                     };
    //                     fetch('/getWinner', requestOptions) // get winner returns the winner of the game
    //                         .then(winningSide => winningSide.json())
    //                         .then((winningSide) => {
    //                             tempGameData = {
    //                                 'p1': {'name': gameData.p1.name, 'side': gameData.p1.side, 'wallet': gameData.p1.wallet}, 
    //                                 'p2': {'name': otherPlayerData.name, 'side': otherPlayerData.side, 'wallet': otherPlayerData.wallet}, 
    //                                 'bet': gameData.bet,
    //                                 'winningSide': winningSide.side,
    //                                 'gameID': gameData.gameID
    //                             };
    //                         })
    //                         .then(() => {
    //                             fetch('/endGame', requestOptions); // end game removes the game from the servers database
    //                         })
    //                         .then(() => {
    //                             changeGameData(tempGameData);
    //                         })
    //                         .catch(err => {
    //                             console.log(err);
    //                             window.location.href = "/";
    //                         })
                        
    //                 }
    //             })
    //             .catch(err => {
    //                 console.log(err);
    //                 window.location.href = "/";
    //             })
    // }
    console.log("here")

    useEffect(() => {
        if (gameData === null) {
            console.log("here somehow")
            return; // this is to not allow people onto this page if they haven't gone through the 'flip' page
        }
        if (gameData.gameID === null) {
            let requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({name: gameData.p1.name})
            };
            fetch('/getPlayerGame', requestOptions)
                .then(result => result.json())
                .then(playerGame => {
                    if (playerGame.error) {
                        console.log(playerGame.error)
                        console.log("here baby")
                        changeGameData(null);
                    }
                    console.log(playerGame)
                    if (playerGame.found) { // .found means the player exists
                        if (playerGame.gameID) { // if .gameID is not null then the game already exists - don't create a new one
                            changeGameData({
                                'p1': {'name': gameData.name, 'side': gameData.side, 'wallet': gameData.wallet}, 
                                'p2': {'name': playerGame.p2.name, 'side': playerGame.p2.side, 'wallet': playerGame.p2.wallet}, 
                                'bet': gameData.bet,
                                'winningSide': playerGame.winner,
                                'gameID': playerGame.gameID
                            });
                            return "game exists";
                        }
                        else {
                            console.log("right here??")
                            return "game doesn't exist";
                        }
                    }
                    else { // the player doesnt exist - so this page was reached without going through 'flip' page (illegally)
                        return "player doesn't exist";
                    }
                })
                .then(async (gameState) => {
                    if (gameState === "game exists") { // player exists and is already in a game - this was probably an accidental page refresh
                        return null; // all state changes have already been made. This function will reload and schedule poll or show results
                    }
                    else if (gameState === "game doesn't exist") { // player exists, but has not joined a game - so join one here
                        let requestOptions = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({"name": gameData.p1.name})
                        };
                        await fetch('/joinGame', requestOptions)
                            .then(result => result.json())
                            .then(result => {
                                console.log("how did i make it this far")
                                // if (!result) return null;
                                if (result.error) {
                                    console.log(result.error)
                                    console.log("how many error things doi have")
                                    changeGameData(null);
                                }
                                console.log(result);
                                // changeGameData({
                                //     'p1': {'name': gameData.name, 'side': gameData.side, 'wallet': gameData.wallet}, 
                                //     'p2': {'name': result.p2.name, 'side': result.p2.side, 'wallet': result.p2.wallet}, 
                                //     'bet': gameData.bet,
                                //     'winningSide': result.winner,
                                //     'gameID': gameData.gameID
                                // });
                            }) // join this player into a game
                    }
                    else { // this will cause a recall of this function while will force the user to be routed back to home
                        console.log("just kidding im here")
                        changeGameData(null);
                        return null;
                    }
                })
                .catch(err => {
                    console.log(err);
                    console.log("ok last one")
                    changeGameData(null);
                    return null;
                })
        }
        else if (gameData.winner === null) { 
            setTimeout(loadGame, 3000); // this client is p1, so schedule the polling for p2 to join
        }
        else if (gameData.winner !== null) {
            setTimeout(() => {setGameFinished(true)}, 6000);
        }
    }, []);

    return (
        (gameData ?
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
        : <Navigate to="/" />)
    );
}

export default Game;