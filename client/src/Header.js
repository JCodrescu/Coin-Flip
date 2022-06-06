import Hamburger from './Hamburger'
import './Header.css';
import coinLoading from './coin-back-loading.svg';
import CoinFlip from './CoinFlip';

function Header(props) {

    return (
        <div className='StartHeader'>
            <div className='Balance'>
            </div>
            <a id="StartLogo" href='/'>
                <div className='StartLogo'>
                    <CoinFlip className="CoinFlipAnimation" width={60} height={60} animation={'loading'} winningSide={null} image={coinLoading}/>
                    <span id="flip">FLIP</span>
                </div>
            </a>
            <Hamburger onMenuClick={props.onMenuClick} width="50" height="50" class="Hamburger"/>
        </div>  
        
    );
};

export default Header;