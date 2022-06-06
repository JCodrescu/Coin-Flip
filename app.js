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

let game = 1;
client.query('truncate table Games; truncate table Players', (err, result) => {
        if (err) throw err;
    }
);

function clearOldGames() {
    client
        .query(`select count(*) from games`)
        .then(result => {
            console.log("current game count: " + result.rows[0].count);
            if (result.rows[0].count >= 9999) {
                return client.query("delete from games where created < NOW() - INTERVAL '15 minutes'")
            }
        })
        .catch(err => {
            console.log(err);
        })
    setTimeout(clearOldGames, 600000); // rerun every 10 mins
}
clearOldGames();

app.post('/joinGame', (req, res) => {
    const {name, side, bet} = req.body;
    if (!name || !bet) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    let gameID = null;
    let response = null;

    client
        .query('begin')
        .then(result => {
            return client.query(
                `select p1_name as name, p1_side as side, id
                from Games
                where p2_name is null
                and p1_side <> $1
                and bet = $2`,
                [side, bet === "None" ? 0 : bet]
            );
        })
        .then(result => {
            if (result.rows.length > 0) { // if there is a game available to join, join it
                let side = result.rows[0].side === 'Heads' ? 'Tails' : 'Heads';
                winner = Math.floor(Math.random() * 2) % 2 === 0 ? 'Heads' : 'Tails' // decide winner here
                response = {
                    'name': result.rows[0].name, 
                    'side': result.rows[0].side, 
                    'gameID': result.rows[0].id, 
                    'winner': winner,
                    'givenSide': side};
                return client.query(
                    'update Games set p2_name = $1, p2_side = $2, winner = $3, created = $4 where id = $5',
                    [name, side, winner, new Date(), result.rows[0].id]
                );
            }
            else { // if no game are a match then create a new one
                gameID = game;
                game++;
                let coinSide = side !== "Choose For Me" ? side : Math.floor(Math.random() * 2) % 2 === 0 ? 'Heads' : 'Tails';
                if (game > 10000) game = 1;
                response = {'name': null, 'wallet': null, 'side': null, 'gameID': gameID, 'winner': null, 'givenSide': coinSide};
                return client.query(
                    'insert into Games (p1_name, p1_side, p2_name, p2_side, bet, winner, id, created) values ($1, $2, null, null, $3, null, $4, null)',
                    [name, coinSide, bet === "None" ? 0 : bet, gameID]
                );
            }
        })
        .then(result => {
            return client.query("commit");
        })
        .then(result => {
            res.json(response);
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({'error': `Game was not created. Please try again. Error: ${err}`});
            return client.query("rollback");
        })
        .catch((err) => {
            // incase there is an error when rolling back, log it
            res.status(500).json({'error': `error while rolling back transaction: ${err}`});
        });
});

app.post('/checkGameState', (req, res) => { // used for p1 to poll until another player has joined the game
    const {gameID} = req.body;
    if (!gameID) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query(`select p2_name as name, p2_side as side, winner
                from Games
                where Games.id = ${gameID}`)
        .then(result => {
            if (result.rows.length === 1) { // game exists
                res.json({'name': result.rows[0].name, 'side': result.rows[0].side, 'winner': result.rows[0].winner});
            }
            else { // game does not exist
                res.status(400).json({'error': "game doesn't exist"});
            }
        })
        .catch(err => {
            res.status(500).json({'error': `error on game query: ${err}`});
        })
});

app.get('/clearTable', (req, res) => { // for management purposes
    client.query(`
        drop table if exists Games;
        
        create table Games (
        p1_name varchar(100) not null,
        p1_side varchar(10) not null,
        p2_name varchar(100),
        p2_side varchar(10),
        bet integer,
        winner varchar(10),
        created timestamp,
        id integer primary key
        ); `, 
        (err, result) => {
            if (err) throw err;
        }
    );
    res.send("success");
});

app.get('/findWaiting', (req, res) => { // used to show all open games on the homescreen
    client
        .query(`select p1_name as name, p1_side as side, bet
                from Games
                where p2_name is null`)
        .then(result => {
            let players = []
            for (let row of result.rows) {
                players.push({'name': row.name, 'bet': row.bet, 'side': row.side});
            }
            res.json({'players': players});
        })
        .catch(err => {
            res.status(500).json({'error': `database failed on waiting player lookup: ${err}`});
        })
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(port, () => {console.log(`listening on port ${port}`)});
