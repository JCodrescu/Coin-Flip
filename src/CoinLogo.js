import logo from './solana-sol-logo.svg';

function CoinLogo(props) {
    return (
        <div className={props.class}>
            <img src={logo} height={props.height} width={props.width} alt="logo" />
        </div>
    );
}

export default CoinLogo;