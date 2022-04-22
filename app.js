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


        /*
            client.query('drop table if exists Game;', (err, res) => {
            client.query('create table Game (p1_name varchar (100) not null, p1_side varchar(100) not null, p1_wallet varchar(100) not null, p2_name varchar (100), p2_side varchar(100), p2_wallet varchar(100), bet integer, winner varchar(10), gametime timestamp, unique (p1_name, p1_side, p1_wallet));', (err, res) => {
            client.query('create table Player (playerName varchar (100),side varchar(100), bet integer, wallet varchar(100), primary key (playerName, wallet));', (err, res) => {
        */

app.post('/addPlayer', (req, res) => {
    const {playerName, side, bet, wallet} = req.body;
    if (playerName === null, side === null, bet === null, wallet === null) {
        res.json({'Please include the necessary body: {name, side, bet, wallet}': ''});
        return;
    }

    // check if the request is just a re-request (dont re add the player if so)
    client.query('select * from Game where (p1_name = $1 and p1_side = $2 and p1_wallet = $3 and bet = $4) or (p2_name = $1 and p2_side = $2 and p1_wallet = $3 and bet = $4);', 
        [playerName, side, wallet, bet],
        (err, result) => {  
            if (err) throw err;
            if (result.rows.length > 0) {
                console.log('game already exists');
                res.json({'note': 'player already in game'});
            }   
            else {
                // check if you can add player into an existing game
                client.query('select * from Game where p2_name is null and bet = $1 and p1_side <> $2',
                    [bet, side],
                    (err, result) => {
                        if (err) throw err;
                        if (result.rows.length > 0) {
                            console.log('adding player to game');
                            let op = result.rows[0];
                            client.query('update Game set p2_name = $1, p2_side = $2, p2_wallet = $3, gametime = $4',
                                [playerName, side, wallet, new Date()],
                                (err, result) => {
                                    if (err) throw err;
                                }
                            );
                            res.json({'player': {'name': op.p1_name, 'wallet': op.p1_wallet, 'side': op.p1_side}});
                        }
                        else {
                            // start new game
                            client.query('insert into Game (p1_name, p1_side, p1_wallet, p2_name, p2_side, p2_wallet, bet, winner, gametime) values ($1, $2, $3, null, null, null, $4, $5, $6);', 
                                [playerName, side, wallet, bet, (Math.floor(Math.random() * 2) % 2 === 0 ? 'Heads' : 'Tails'), new Date()],
                                (err, result) => {
                                    if (err) throw err;
                                    console.log('starting new game');
                                    res.json({'player': null}) // to signify that the game is not ready
                                }
                            );
                        }
                    }
                );
            }
        }   
    );
});

app.get('/clearTable', (req, res) => {
    client.query('truncate table game;', (err, result) => {
    if (err) throw err;
    });
    res.send('Success');
});

app.get('/findWaiting', (req, res) => {
    let players = []
    client.query('select distinct p1_name, bet from Game where p2_name is null;', (err, result) => {
    if (err) throw err;
    for (let row of result.rows) {
        players.push({'name': row.p1_name, 'bet': row.bet});
    }
    res.json({'players': players});
    });
});

app.post('/findPlayer', (req, res) => {
    const {playerName, side, bet, wallet} = req.body;
    if (side === 'Choose For Me') {
        side = 'Heads'
    }

    // client.query(`select * from Game 
    //             where bet = ${bet} 
    //             and side LIKE '${(side === 'Heads' ? 'Tails' : 'Heads')}'
    //             and playerName <> '${playerName}'
    //             and wallet <> '${wallet}';`
    //             , (err, res) => {
    // if (err) throw err;
    // for (let row of res.rows) {
    //     res.json(row);
    // }
    // });
});

app.post('/gameWinner', (req, res) => {
    const {playerName, side, bet, wallet} = req.body;
    if (playerName === null, side === null, bet === null, wallet === null) {
        res.json({'Please include the necessary body: {name, side, bet, wallet}': ''});
        return;
    }

    client.query('select * from Game where (p1_name = $1 and p1_side = $2 and p1_wallet = $3 and bet = $4) or (p2_name = $1 and p2_side = $2 and p1_wallet = $3 and bet = $4);', 
        [playerName, side, wallet, bet],
        (err, result) => {  
            if (err) throw err;
            if (result.rows.length > 0) {
                res.json({'winner': result.rows[0].winner});
            }
            else {
                res.json({'winner': 'NA'});
            }
        }
    );
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
 });

app.listen(port, () => console.log(`listening on port ${port}`));
