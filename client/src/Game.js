import CoinFlip from "./CoinFlip";
import { useLocation } from 'react-router-dom';
import { useState } from "react";
import backReady from './coin-back-ready.svg';
import backLoading from './coin-back-loading.svg';
import Player from './Player';
import './Game.css';
import Confetti from 'react-confetti';

function Game() {
    const location = useLocation()
    const { player1Name, player1Bet, player1Side } = location.state;
    const [player2Side, changePlayer2Side] = useState(player1Side === 'Heads' ? 'Tails' : 'Heads');
    const [flipState, setFlipState] = useState('loading');
    const [result, setResult] = useState(null);
    const [winningSide, setWinningSide] = useState(Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails');

    console.log(window.innerWidth);

    function reset() {
        setFlipState('loading');
        setWinningSide(Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails');
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
                {player2Side === null ? <div style={{width: '300px', height: '150px'}}></div> : <Player name="me" side={player1Side === 'Heads' ? 'Tails' : 'Heads'} result={player2Side === result ? '-winner' : ''}/>}
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