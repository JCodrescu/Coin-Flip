const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { Client } = require('pg')

app.use(cors());
app.use(express.static(path.join(__dirname, 'client', 'build')));;

console.log(process.env.DATABASE_URL);

const client = (() => {
if (process.env.NODE_ENV !== 'production') {
    return new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });
} else {
    return new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
          }
    });
} })();


client.connect();

// client.query('', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });

app.get('/gameWinner', (req, res) => {
    res.json({'winner': (Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails')});
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
 });

app.listen(port, () => console.log(`listening on port ${port}`));
