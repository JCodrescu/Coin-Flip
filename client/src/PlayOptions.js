import './PlayOptions.css'

function PlayOptions() {
    return (
        <div className="PlayOptions">
            <a 
                href="/flip"
                className='PlayOption'
            >
                flip
            </a>
            <a 
                href="/flip"
                className='PlayOption'
            >
                create private room
            </a>
            <a 
                href="/flip"
                className='PlayOption'
            >
                join private room
            </a>
        </div>
    );
};

export default PlayOptions;