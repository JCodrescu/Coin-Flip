import CoinLogo from './CoinLogo';
import Hamburger from './Hamburger'
import './StartHeader.css'

function StartHeader(props) {
    return (
        <div className='StartHeader'>
            <div className='emptyDiv'></div>
            <div className='StartLogo'>
                <CoinLogo width="68" height="68" class="CoinLogo"/>
                <span id="flip">FLIP</span>
            </div>
            <Hamburger onMenuClick={props.onMenuClick} width="50" height="50" class="Hamburger"/>
        </div>  
        
    );
};

export default StartHeader;