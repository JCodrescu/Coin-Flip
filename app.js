const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000

app.use(cors())

app.get('/', (req, res) => {
   res.json({'yes': 'wooooo'});
});

app.get('/gameWinner', (req, res) => {
    res.json({'winner': (Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails')});
});

app.listen(port, () => console.log(`listening on port ${port}`));
