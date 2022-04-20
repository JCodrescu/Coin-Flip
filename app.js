const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'client', 'build')));

console.log(path.join(__dirname, 'client', 'build'));

app.get('/gameWinner', (req, res) => {
    res.json({'winner': (Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails')});
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
 });

app.listen(port, () => console.log(`listening on port ${port}`));
