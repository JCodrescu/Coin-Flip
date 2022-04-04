import './OverlayMenu.css';
import Hamburger from './Hamburger';

function OverlayMenu(props) {
    let active = '';
    if (props.isMenuActive) {
        active = '-active';
    }
    console.log("side-menu" + active)
    return (
        <div onClick={() => console.log("here")} className={"side-menu" + active}>
            <div onClick={props.closeMenu} className={"side-menu__overlay" + (props.isMenuActive ? "-active" : "")} />
            <div className={"side-menu__content" + (props.isMenuActive ? "-active" : "")}>
                <Hamburger id="MenuHamburger" onMenuClick={props.closeMenu} width="50" height="50" class='MenuOption'/>
                <div className='MenuOptions'>
                    <a 
                        href=""
                        className='MenuOption'
                    >
                        About Me
                    </a>
                    <a 
                        href=""
                        className='MenuOption'
                    >
                        How it works
                    </a>
                    <a 
                        href=""
                        className='MenuOption'
                    >
                        How I made this
                    </a>
                </div>
            </div>
        </div>
    );
}

export default OverlayMenu;

