import './PlayOptions.css'

function PlayOptions(props) {
    return (
        <div className="PlayOptions">
            <a 
                href="/flip"
                className='PlayOption'
            >
                flip a coin
            </a>
        </div>
    );
};

export default PlayOptions;