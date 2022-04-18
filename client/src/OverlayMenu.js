import './OverlayMenu.css';
import QuitButton from './QuitButton';

function OverlayMenu(props) {
    let active = '';
    if (props.isMenuActive) {
        active = '-active';
    }
    return (
        <div className={"side-menu" + active}>
            <div onClick={props.closeMenu} className={"side-menu__overlay" + (props.isMenuActive ? "-active" : "")} />
            <div className={"side-menu__content" + (props.isMenuActive ? "-active" : "")}>
                <QuitButton id="quitButton" onMenuClick={props.closeMenu} width="30" height="30"/>
                <div className='MenuOptions'>
                    <a 
                        href="/"
                        className='MenuOption'
                    >
                        About Me
                    </a>
                    <a 
                        href="/"
                        className='MenuOption'
                    >
                        How it works
                    </a>
                    <a 
                        href="/"
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

