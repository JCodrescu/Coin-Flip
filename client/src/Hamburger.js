import hamburger from './hamburger.svg';

function Hamburger(props) {
    return (
        <div className={props.class} id={props.id}>
            <img onClick={props.onMenuClick} src={hamburger} width={props.width} height={props.height} alt="menu" />
        </div>
    );
};

export default Hamburger;