const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { Client } = require('pg')
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.static(path.join(__dirname, 'client', 'build')));;
app.use(express.json());

const client = (() => {
if (process.env.NODE_ENV !== 'production') {
    return new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true
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

app.post('/addPlayer', (req, res) => {
    const {playerName, side, bet, wallet} = req.body;
    console.log(playerName, side, bet, wallet);

    client.query('create table Game (p1_name varchar (100) not null, p1_side varchar(100) not null, p1_wallet varchar(100) not null, p2_name varchar (100), p2_side varchar(100), p2_wallet varchar(100), bet integer, gametime time);', (err, res) => {
    // client.query(`insert into Player (playerName, side, bet, wallet) values ('${playerName}', '${side}', ${bet}, '0x111222');`, (err, res) => {
    // client.query('create table Player (playerName varchar (100),side varchar(100), bet integer, wallet varchar(100), primary key (playerName, wallet));', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    });
})

app.post('/findPlayer', (req, res) => {
    const {playerName, side, bet, wallet} = req.body;
    if (side === 'Choose For Me') {
        side = 'Heads'
    }

    console.log(`select * from Player 
    where bet = ${bet} 
    and side LIKE '${(side === 'Heads' ? 'Tails' : 'Heads')}'
    and playerName <> '${playerName}' 
    and wallet <> '${wallet}';`);

    client.query(`select * from Player 
                where bet = ${bet} 
                and side LIKE '${(side === 'Heads' ? 'Tails' : 'Heads')}'
                and playerName <> '${playerName}'
                and wallet <> '${wallet}';`
                , (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        res.json(row);
    }
    });
})

app.get('/gameWinner', (req, res) => {
    res.json({'winner': (Math.floor(Math.random() * 2) === 0 ? 'Heads' : 'Tails')});
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
 });

app.listen(port, () => console.log(`listening on port ${port}`));
