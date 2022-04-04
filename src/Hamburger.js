import hamburger from './hamburger.svg';
import './Hamburger.css';

function Hamburger(props) {
    return (
        <div className={props.class} id={props.id}>
            <img id="hamburger-button" onClick={props.onMenuClick} src={hamburger} width={props.width} height={props.height} alt="menu" />
        </div>
    );
};

export default Hamburger;