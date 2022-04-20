const express = require('express');
const app = express();
const cors = require('cors')

app.use(cors())
const port = 3001;

app.get('/gameWinner', (req, res) => {
    res.json({'winner': (Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails')});
});

app.listen(port, () => console.log(`listening on port ${port}`));