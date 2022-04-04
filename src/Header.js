import Hamburger from './Hamburger';
import './Header.css';
import CoinLogo from './CoinLogo';

function Header() {
  return (
    <div className="Header">
        <CoinLogo width="50" height="50" />
        <Hamburger width="50" height="50" />
    </div>
  );
}

export default Header;
