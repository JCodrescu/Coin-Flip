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

let game = 0;
client.query('truncate table game;', (err, result) => {
        if (err) throw err;
    }
);


// add player checks if a game exists where the player can join, else create a new game
app.post('/addPlayer', (req, res) => {
    const {name, side, bet, wallet} = req.body;
    if (name === null || side === null || bet === null || wallet === null) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    let gameID = -1;
    let op = null;
    let response = {'error': 'this didnt work like i thought it would'};

    client
        .query("begin") // begin transaction to avoid race conditions when starting/joining games
        .then(res => {
            // first check for an open game
            return client.query(
                "select * from Game where p2_name is null and bet = $1 and p1_side <> $2",
                [bet, side]);
        })
        .then(result => {
            // if there is an available game, join it
            if (result.rows.length > 0) {
                op = result.rows[0];
                gameID = op.gameid;
                response = {'name': op.p1_name, 'wallet': op.p1_wallet, 'side': op.p1_side, 'gameID': gameID};
                return client.query('update Game set p2_name = $1, p2_side = $2, p2_wallet = $3, gametime = $4 where gameID = $5',
                    [name, side, wallet, new Date(), gameID]);
            }
            // if there are no available games, start a new one
            else {
                game += 1;
                gameID = game;
                response = {'name': null, 'wallet': null, 'side': null, 'gameID': gameID};
                if (game > 1000000) game = 1;
                return client.query('insert into Game (p1_name, p1_side, p1_wallet, p2_name, p2_side, p2_wallet, bet, winner, gametime, gameID) values ($1, $2, $3, null, null, null, $4, $5, $6, $7);', 
                    [name, side, wallet, bet, (Math.floor(Math.random() * 2) % 2 === 0 ? 'Heads' : 'Tails'), new Date(), game]);
            }
        })
        .then(result => {
            // once that's done, run the commit statement to
            // complete the transaction
            return client.query("commit");
        })
        .then((result) => {
            // if the transaction completes successfully
            // log a confirmation statement
            console.log("transaction completed");
            res.json(response);
        })
        .catch((err) => {
            // incase there are any errors encountered
            // rollback the transaction
            console.error("error while querying:", err);
            res.status(500).json({'error': 'Game data was not stored. Please try again.'});
            return client.query("rollback");
        })
        .catch((err) => {
            // incase there is an error when rolling back, log it
            console.error("error while rolling back transaction:", err);
            res.status(500).json({'error': 'database failed'});
        });
    }
);

    // // check if you can add player into an existing game
    // client.query('select * from Game where p2_name is null and bet = $1 and p1_side <> $2',
    //     [bet, side],
    //     (err, result) => {
    //         if (err) throw err;
    //         if (result.rows.length > 0) {
    //             console.log('adding player to game');
    //             let op = result.rows[0];
    //             // add player to existing game
    //             client.query('update Game set p2_name = $1, p2_side = $2, p2_wallet = $3, gametime = $4 where p1_name = $5 and p1_side = $6 and p1_wallet = $7',
    //                 [name, side, wallet, new Date(), op.p1_name, op.p1_side, op.p1_wallet],
    //                 (err, result) => {
    //                     if (err) throw err;
    //                 }
    //             );
    //             res.json({'name': op.p1_name, 'wallet': op.p1_wallet, 'side': op.p1_side});
    //         }
    //         else {
    //             // start new game
    //             client.query('insert into Game (p1_name, p1_side, p1_wallet, p2_name, p2_side, p2_wallet, bet, winner, gametime) values ($1, $2, $3, null, null, null, $4, $5, $6);', 
    //                 [name, side, wallet, bet, (Math.floor(Math.random() * 2) % 2 === 0 ? 'Heads' : 'Tails'), new Date()],
    //                 (err, result) => {
    //                     if (err) throw err;
    //                     console.log('starting new game');
    //                     res.json({'name': null, 'wallet': null, 'side': null}) // to signify that the game is not ready
    //                 }
    //             );
    //         }
    //     }

app.post('/otherPlayerData', (req, res) => {
    const {gameID} = req.body;
    if (!gameID) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query('select * from Game where gameID = $1;', 
            [gameID])
        .then(result => {
            if (result.rows.length === 1) {
                const gameRow = result.rows[0];
                res.json({'name': gameRow.p2_name, 'wallet': gameRow.p2_wallet, 'side': gameRow.p2_side});
            }
            else {
                res.status(500).json({'error': 'This game has multiple instances. Please try again in 5 minutes.'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({'error': 'database lookup failed'});
        })
    }
);

app.post('/updateTime', (req, res) => {
    const {gameID} = req.body;
    if (!gameID) {
        res.status(400).json({'error': 'please include game id in body of request'});
        return;
    }
    client
        .query('update Game set gametime = $1 where gameID = $2',
            [new Date(), gameID])
        .catch(err => {
            console.log(err);
            res.status(500).json({'error': 'database failed on update time'});
            }
        );
    res.json({"result": "success"});
    }
);

app.post('/decideWinner', (req, res) => {
    const {gameID} = req.body;
    if (!gameID) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query('select * from Game where gameID = $1',
            [gameID])
        .then(result => {
            if (result.rows.length > 0) {
                console.log('initiating money transfer');
                let gameData = result.rows[0];
                res.json({'side': gameData.winner});
            }
            else {
                res.status(400).json({'error': 'Game doesnt exist'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({'error': 'database failed on winner lookup'});
        });
    }
);

app.post('/getWinner', (req, res) => {
    const {gameID} = req.body;
    if (!gameID) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query('select * from Game where gameID = $1',
            [gameID])
        .then(result => {
            if (result.rows.length > 0) {
                console.log('no money transfer here');
                let gameData = result.rows[0];
                res.json({'side': gameData.winner});
            }
            else {
                res.status(400).json({'error': 'Game doesnt exist'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({'error': 'database failed on winner lookup'});
        });
    }
);

app.post('/endGame', (req, res) => {
    const {gameID} = req.body;
    if (!gameID) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query('delete from Game where gameID = $1',
            [gameID])
        .catch(err => {
            console.log(err);
            res.status(500).json({'error': 'database delete failed'});
        });
    res.json({"result": "success"});
    }
);

app.get('/clearTable', (req, res) => {
    client.query('truncate table game;', (err, result) => {
    if (err) throw err;
    });
    // client.query('drop table if exists Game');
    // client.query(`create table Game (
    //     p1_name varchar (100) not null,
    //     p1_side varchar(100) not null, 
    //     p1_wallet varchar(100) not null, 
    //     p2_name varchar (100),
    //     p2_side varchar(100), 
    //     p2_wallet varchar(100), 
    //     bet integer not null, 
    //     winner varchar(100) not null,
    //     gametime timestamp not null,
    //     gameID int primary key); `);
    // res.send('Success');
});

app.get('/findWaiting', (req, res) => {
    let players = []
    client
        .query('select p1_name, p1_side, bet from Game where p2_name is null;')
        .then(result => {
            for (let row of result.rows) {
                players.push({'name': row.p1_name, 'bet': row.bet, 'side': row.p1_side, 'gameID': row.gameId});
            }
            res.json({'players': players});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({'error': 'database failed on waiting player lookup'});
        })
    }
);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    }
);

app.listen(port, () => {console.log(`listening on port ${port}`)});
