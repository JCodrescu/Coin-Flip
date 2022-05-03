import './PlayOptions.css'

function PlayOptions() {
    return (
        <div className="PlayOptions">
            <a 
                href="/flip"
                className='PlayOption'
            >
                flip a coin
            </a>
            <a 
                href="/flip"
                className='PlayOption'
            >
                create private game
            </a>
            <a 
                href="/flip"
                className='PlayOption'
            >
                join private game
            </a>
        </div>
    );
};

export default PlayOptions;