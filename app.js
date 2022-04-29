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

app.post('/addPlayer', (req, res) => {
    const {name, wallet, side, bet} = req.body;
    if (!name || !side || !bet || !wallet) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query(
            'insert into Players (name, side, wallet, bet, gameID, created) values ($1, $2, $3, $4, null, $5)',
            [name, side, wallet, bet, new Date()])
        .then(result => {
            res.json({'result': 'success'});
        })
        .catch(err => { 
            if (err.code === '23505') {
                res.status(500).json({'result': 'username taken'});
            }
            else {
                res.status(500).json({'result': `error: ${err}`})
            }
            
        })
})

app.post('/getPlayerGame', (req, res) => {
    const {name} = req.body;
    if (!name) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query(
            "select * from Players where name = $1",
            [name])
        .then(result => {
            if (result.rows.length === 1) {
                if (result.rows[0].gameid) {
                    return client.query(
                        `select *
                        from Games 
                            left join Players on Games.p2 = Players.name
                        where id = $1
                        `,
                        [result.rows[0].gameid]
                    );
                }
                else {
                    return result;
                }
            }
            else {
                return result;
            }
        })
        .then(result => {
            if (result.rows.length === 1) { // player exists, game may or may not exist
                if (result.rows[0].id) { // if id is a field, then the game exists (this is because the left join query must of been run is id is a field)
                    res.json({
                        'found': true, 
                        'gameID': result.rows[0].id,
                        "winner": result.rows[0].winner,
                        'p2': result.rows[0].p2 ? {'name': result.rows[0].name, 'side': result.rows[0].side, 'wallet': result.rows[0].wallet} 
                                                : {'name': null, 'side': null, 'wallet': null}
                    })
                }
                else { // the game does not exist
                    res.json({'found': true, "gameID": null});
                }
            }
            else { // player does not exist
                res.json({'found': false})
            }
        })
        .catch(err => {
            console.error("error while querying:", err);
            res.status(500).json({'error': `Database failed while querying: ${err}`});
        })
});

app.post('/joinGame', (req, res) => {
    const {name} = req.body;
    if (!name) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    let gameID = null;
    let response = null;

    client
        .query('begin')
        .then(result => {
            return client.query(
                `select *
                from Players
                where name = $1`,
                [name]
            );
        })
        .then(result => {
            if (result.rows.length === 1) {
                return client.query(
                    `select * 
                    from Games join Players on Games.p1 = Players.name
                    where Games.p2 is null
                    and Players.side <> $2
                    and Players.bet = $3`,
                    [result.rows[0].name, result.rows[0].side, result.rows[0].bet]
                );
            }
            else {
                return "player doesn't exist";
            }
        })
        .then(result => {
            if (result === "player doesn't exist") {
                return "player doesn't exist";
            }
            if (result.rows.length > 0 && result.rows[0].name === name) {
                gameID = result.rows[0].id;
                console.log("here")
                response = {'name': name, 'wallet': result.rows[0].wallet, 'side': result.rows[0].side, 'gameID': result.rows[0].id, 'winner': winner};
                return;
            }
            if (result.rows.length > 0) {
                winner = Math.floor(Math.random() * 2) % 2 === 0 ? 'Heads' : 'Tails' // decide winner here
                response = {'name': result.rows[0].name, 'wallet': result.rows[0].wallet, 'side': result.rows[0].side, 'gameID': result.rows[0].id, 'winner': winner};
                return client.query(
                    'update Games set p2 = $1, winner = $2 where id = $3',
                    [name, winner, result.rows[0].id]
                );
            }
            else {
                gameID = game;
                game++;
                if (game > 10000) game = 1;
                response = {'name': null, 'wallet': null, 'side': null, 'gameID': gameID, 'winner': null};
                return client.query(
                    'insert into Games (p1, p2, winner, id) values ($1, null, null, $2)',
                    [name, gameID]
                );
            }
        })
        .then(result => {
            if (result === "player doesn't exist") {
                return "player doesn't exist";
            }
            return client.query(
                'update Players set gameID = $1 where name = $2',
                [gameID, name]
            )
        })
        .then(result => {
            if (result === "player doesn't exist") {
                return "player doesn't exist";
            }
            return client.query("commit");
        })
        .then(result => { 
            if (result === "player doesn't exist") {
                res.status(400).json({'error': 'Player does not exist'});
            }
            else {
                if (response.name) {
                    console.log("money transfer happening!"); // transfer money here
                }
                else {
                    console.log("new game. no money transfer yet.");
                }
                res.json(response);
            }
        })
        .catch((err) => {
            res.status(500).json({'error': `Game was not created. Please try again. Error: ${err}`});
            return client.query("rollback");
        })
        .catch((err) => {
            // incase there is an error when rolling back, log it
            res.status(500).json({'error': `error while rolling back transaction: ${err}`});
        });
});

// app.post('/decideWinner', (req, res) => {
//     const {gameID} = req.body;
//     if (!gameID) {
//         res.status(400).json({'error': 'please include necessary body'});
//         return;
//     }
//     client
//         .query('select * from Games where id = $1',
//             [gameID])
//         .then(result => {
//             if (result.rows.length === 1) {
//                 console.log('initiating money transfer');
//                 res.json({'side': result.rows[0].winner});
//             }
//             else {
//                 res.status(400).json({'error': 'Game doesnt exist'});
//             }
//         })
//         .catch(err => {
//             res.status(500).json({'error': `database failed on winner query: ${err}`});
//         });    
// });

app.post('/getWinner', (req, res) => {
    const {gameID} = req.body;
    if (!gameID) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query('select * from Games where id = $1',
            [gameID])
        .then(result => {
            if (result.rows.length === 1) {
                console.log('no money transfer here');
                res.json({'side': result.rows[0].winner});
            }
            else {
                res.status(400).json({'error': 'Game doesnt exist'});
            }
        })
        .catch(err => {
            res.status(500).json({'error': `database failed on winner query: ${err}`});
        });
    }
);

app.post('/endGame', (req, res) => {
    const {name, gameID} = req.body;
    if (!gameID || !name) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client
        .query(
            'delete from Games where id = $1',
            [gameID])
        .then(result => {
            return client.query(
                'delete from Players where name = $1',
                [name]
            )
        })
        .catch(err => {
            res.status(500).json({'error': `database delete failed: ${err}`});
        });
    res.json({"result": "success"});
});

app.get('/clearTable', (req, res) => {
    client.query(`
        drop table if exists Games;
        drop table if exists Players;
        
        create table Players (
        name varchar (100) primary key,
        side varchar(10) not null, 
        wallet varchar(100) not null, 
        bet integer not null, 
        gameID integer unique,
        created timestamp not null
        ); 
        
        create table Games (
        p1 varchar(100) not null,
        p2 varchar(100),
        winner varchar(10),
        id integer primary key
        ); `, 
        (err, result) => {
            if (err) throw err;
        }
    );
    res.send("success");
});

app.get('/findWaiting', (req, res) => {
    client
        .query(`select name, side, bet
                from Games join Players on Games.p1 = Players.name
                where p2 is null`)
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
