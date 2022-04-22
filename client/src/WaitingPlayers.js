import { useEffect, useState } from 'react';
import './WaitingPlayers.css';

function Player(props) {
    return (
        <div className='WaitingPlayer'>
            <div className='WaitingPlayerName'>{props.name}</div>
            <div className='WaitingPlayerBet'>bet:  ${props.bet}</div>
        </div>
    )
}

function WaitingPlayers() {
    const [WaitingPlayers, setWaitingPlayers] = useState([]);

    useEffect(() => {
        async function loadPlayerData() {
            let players = await loadWaitingPlayers(); 
            setWaitingPlayers(players);
        }
        loadPlayerData();
        const interval = setInterval(async () => {
            let players = await loadWaitingPlayers(); 
            console.log(players); 
            setWaitingPlayers(players);
        }, 5000);
      
        return () => clearInterval(interval);
      }, []);

    async function loadWaitingPlayers() {
        let players = [];
        await fetch('/findWaiting')
            .then(res => res.json())
            .then((result) => {
                for (let i=0; i < result.players.length; i++) {
                    let player = result.players[i];
                    players.push(<Player name={player.name} bet={player.bet} key={player.name}/>);
                    console.log(player);
                }
            });
        return players;
    }

    return (
        <div className="WaitingPlayers">
            <div className='WaitingPlayersTitle'>All Players</div>
            <div className='WaitingPlayersBody'>{WaitingPlayers}</div>
        </div>
    );
};

export default WaitingPlayers;