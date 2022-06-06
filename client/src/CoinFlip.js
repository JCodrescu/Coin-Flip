import front from './coin-front.svg';
import './CoinFlip.css';

function CoinFlip(props) {
    return (
        <div className={"coin-flip-" + props.animation + '-' + props.winningSide}>
            <img id="coin-back" width={props.width} height={props.height} src={props.image} alt="coin" />
            <img id="coin-front" width={props.width} height={props.height} src={front} alt="coin" />
        </div>
    );
}

export default CoinFlip;