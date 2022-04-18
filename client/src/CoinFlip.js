import front from './coin-front.svg';
import './CoinFlip.css';

function CoinFlip(props) {
    console.log("coin-flip-" + props.animation + '-' + props.winningSide);
    return (
        <div className={"coin-flip-" + props.animation + '-' + props.winningSide}>
            <img id="coin-back" width={300} height={300} src={props.image} alt="coin" />
            <img id="coin-front" width={300} height={300} src={front} alt="coin" />
        </div>
    );
}

export default CoinFlip;