import CoinFlip from "./CoinFlip";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import backReady from './coin-back-ready.svg';
import backLoading from './coin-back-loading.svg';
import Player from './Player';
import './Game.css';
import Confetti from 'react-confetti';

function Game() {
    const location = useLocation()
    const { player1Name, player1Bet, player1Side, player1Wallet } = location.state;
    const [player2, changePlayer2] = useState({name: null, side: null, wallet: null});
    const [flipState, setFlipState] = useState('loading');
    const [result, setResult] = useState(null);
    const [winningSide, setWinningSide] = useState('NA');

    useEffect(() => {
        if (player2.name !== null) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({playerName: location.state.player1Name, side: location.state.player1Side, bet: location.state.player1Bet, wallet: location.state.player1Wallet})
            };
            fetch('/gameWinner', requestOptions)
                .then(res => res.json())
                .then((result) => {
                    console.log("here");
                    setWinningSide(result.winner);
                });
        }
    }, [player2])

    useEffect(() => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({playerName: location.state.player1Name, side: location.state.player1Side, bet: location.state.player1Bet, wallet: location.state.player1Wallet})
        };
        fetch('/addPlayer', requestOptions)
            .then(res => res.json())
            .then((result) => {
                if (result.player !== null) {
                    changePlayer2(result.player);
                }
            });
        // fetch('/findPlayer', requestOptions)
        //     .then(res => res.json())
        //     .then((res) => {
        //         if (res.name !== null) {
        //             changePlayer2({side: res.side, wallet: res.wallet, name: res.name});
        //         }
        //         else {
        //             setTimeout(() => {setResult(winningSide)}, 5850);
        //         }
                
        //     });
    }, []);

    function reset() {
        setFlipState('loading');
        fetch('/gameWinner')
            .then(res => res.json())
            .then((result) => {
                setWinningSide(result['winner']);
            });
        setResult(null);
    }

    return (
        <div id="Game">
            <div className="GamePrize">
                <div className="GamePrizeText">Cash Prize:</div>
                <div className="GamePrizeAmount">{player1Bet * 2}</div>
            </div>
            <div id="GameMain">
                <Player name={player1Name} side={player1Side} result={player1Side === result ? '-winner' : ''}/>
                <CoinFlip animation={result === null ? flipState : 'done'} winningSide={winningSide} image={flipState === 'loading' ? backLoading : backReady}/>
                {player2.name === null ? <div style={{width: '300px', height: '150px'}}></div> : <Player name={player2.name} side={player2.side} wallet={player2.wallet} result={result === player2.side ? '-winner' : ''}/>}
            </div>
            <button className='GameButton' onClick={() => {setTimeout(() => {setResult(winningSide)}, 5850); setFlipState('ready')}}>flip</button>
            <button className='GameButton' onClick={() => {reset()}}>reset</button>
            {result !== null ? <Confetti confettiSource={{ x: (winningSide === player1Side ? 0 : window.innerWidth - 300), y: 0, w: 300, h: 0 }}/> : null}
            {result !== null ?  <div className="GameOverOptions">
                                    <a className="GameOverOption" href="/flip">Play Again</a>
                                    <a className="GameOverOption" href="/">Return to Home</a>
                                </div> 
                            : null
            }
        </div>
    );
}

export default Game;