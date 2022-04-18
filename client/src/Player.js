import './Player.css';

function Player(props) {
    return (
        <div className="Player">
            <div className='PlayerRow'>
                <div className='PlayerRowText'>Name:</div>
                <div className={'PlayerRowInput' + (props.result)}>{props.name}</div>
            </div>
            <div className='PlayerRow'>
                <div className='PlayerRowText'>Side:</div>
                <div className={'PlayerRowInput' + (props.result)}>{props.side}</div>
            </div>
            <div className='PlayerRow'>
                <div className='PlayerRowText'>Wallet:</div>
                <div className={'PlayerRowInput' + (props.result)}>0x123456abcdef</div>
            </div>
        </div>
    );
}

export default Player;