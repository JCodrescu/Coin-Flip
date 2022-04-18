const express = require('express');
const app = express();
const port = 3001;

app.get('/gameWinner', (req, res) => {
    res.json({'winner': (Math.floor(Math.random() * 2) === 0 ? 'heads' : 'tails')});
});

app.listen(port, () => console.log(`listening on port ${port}`));