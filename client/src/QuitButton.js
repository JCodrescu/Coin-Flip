import quitButton from './quitButton.svg';

function QuitButton(props) {
    return (
        <div className={props.class} id={props.id}>
            <img onClick={props.onMenuClick} src={quitButton} width={props.width} height={props.height} alt="exit menu" />
        </div>
    );
};

export default QuitButton;