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
            client.query('create table Player (name varchar (100),side varchar(100), bet integer, wallet varchar(100), primary key (name, wallet));', (err, res) => {
        */
       /*
            client.query('select * from Game where (p1_name = $1 and p1_side = $2 and p1_wallet = $3 and bet = $4) or (p2_name = $1 and p2_side = $2 and p1_wallet = $3 and bet = $4);', 
            [name, side, wallet, bet],
            (err, result) => {  
                if (err) throw err;
       */

// add player checks if a game exists where the player can join, else create a new game
app.post('/addPlayer', (req, res) => {
    const {name, side, bet, wallet} = req.body;
    if (name === null || side === null || bet === null || wallet === null) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    console.log(name, side, bet, wallet);
    // check if you can add player into an existing game
    client.query('select * from Game where p2_name is null and bet = $1 and p1_side <> $2',
        [bet, side],
        (err, result) => {
            if (err) throw err;
            if (result.rows.length > 0) {
                console.log('adding player to game');
                let op = result.rows[0];
                // add player to existing game
                client.query('update Game set p2_name = $1, p2_side = $2, p2_wallet = $3, gametime = $4 where p1_name = $5 and p1_side = $6 and p1_wallet = $7',
                    [name, side, wallet, new Date(), op.p1_name, op.p1_side, op.p1_wallet],
                    (err, result) => {
                        if (err) throw err;
                    }
                );
                res.json({'name': op.p1_name, 'wallet': op.p1_wallet, 'side': op.p1_side});
            }
            else {
                // start new game
                client.query('insert into Game (p1_name, p1_side, p1_wallet, p2_name, p2_side, p2_wallet, bet, winner, gametime) values ($1, $2, $3, null, null, null, $4, $5, $6);', 
                    [name, side, wallet, bet, (Math.floor(Math.random() * 2) % 2 === 0 ? 'Heads' : 'Tails'), new Date()],
                    (err, result) => {
                        if (err) throw err;
                        console.log('starting new game');
                        res.json({'name': null, 'wallet': null, 'side': null}) // to signify that the game is not ready
                    }
                );
            }
        }
    );
});

app.post('/otherPlayerData', (req, res) => {
    const {name, side, bet, wallet} = req.body;
    if (name === null || side === null || bet === null || wallet === null) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client.query('select * from Game where p1_name = $1 and p1_side = $2 and p1_wallet = $3 and bet = $4;', 
        [name, side, wallet, bet],
        (err, result) => {  
            if (err) throw err;
            if (result.rows.length === 1) {
                const op = result.rows[0];
                res.json({'name': op.p2_name, 'wallet': op.p2_wallet, 'side': op.p2_side});
            }
            else {
                res.status(500).json({'error': 'this players has created multiple running games. Please wait 1 minute before playing again.'})
            }
        }
    );
});

app.post('/updateTime', (req, res) => {
    const {name, side, bet, wallet} = req.body;
    console.log("time updated");
    if (name === null || side === null || bet === null || wallet === null) {
        res.status(400).json({'error': 'please include necessary body'});
        return;
    }
    client.query('update Game set gametime = $1 where p1_name = $2 and p1_side = $3 and p1_wallet = $4 and bet = $5',
        [new Date(), name, side, wallet, bet],
        (err, result) => {
            if (err) throw err;
        }
    );
});

app.post('/decideWinner', (req, res) => {
    const {p1, p2, bet} = req.body;
    client.query('select * from Game where p1_name = $1 and p1_side = $2 and p1_wallet = $3 and p2_name = $4 and p2_side = $5 and p2_wallet = $6 and bet = $7',
        [p1.name, p1.side, p1.wallet, p2.name, p2.side, p2.wallet, bet],
        (err, result) => {
            if (err) throw err;
            if (result.rows.length > 0) {
                console.log('initiating money transfer');
                let game = result.rows[0];
                res.json({'side': game.winner});
            }
            else {
                res.status(400).json({'error': 'Game doesnt exist'});
            }
        }
    );
});

app.post('/getWinner', (req, res) => {
    const {p1, p2, bet} = req.body;
    client.query('select * from Game where p1_name = $1 and p1_side = $2 and p1_wallet = $3 and p2_name = $4 and p2_side = $5 and p2_wallet = $6 and bet = $7',
        [p1.name, p1.side, p1.wallet, p2.name, p2.side, p2.wallet, bet],
        (err, result) => {
            if (err) throw err;
            if (result.rows.length > 0) {
                console.log('no money transfer happens here');
                let game = result.rows[0];
                res.json({'side': game.winner});
            }
            else {
                res.status(400).json({'error': 'Game doesnt exist'});
            }
        }
    );
})

app.get('/endGame', (req, res) => {
    const {p1, p2, bet} = req.body;
    client.query('delete from Game where p1_name = $1 and p1_side = $2 and p1_wallet = $3 and p2_name = $4 and p2_side = $5 and p2_wallet = $6 and bet = $7',
        [p1.name, p1.side, p1.wallet, p2.name, p2.side, p2.wallet, bet],
        (err, result) => {
            if (err) throw err;
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
    client.query('select distinct p1_name, p1_side, bet from Game where p2_name is null;', (err, result) => {
    if (err) throw err;
    for (let row of result.rows) {
        players.push({'name': row.p1_name, 'bet': row.bet, 'side': row.p1_side});
    }
    res.json({'players': players});
    });
});

app.post('/findPlayer', (req, res) => {
    const {name, side, bet, wallet} = req.body;
    if (side === 'Choose For Me') {
        side = 'Heads'
    }

    // client.query(`select * from Game 
    //             where bet = ${bet} 
    //             and side LIKE '${(side === 'Heads' ? 'Tails' : 'Heads')}'
    //             and name <> '${name}'
    //             and wallet <> '${wallet}';`
    //             , (err, res) => {
    // if (err) throw err;
    // for (let row of res.rows) {
    //     res.json(row);
    // }
    // });
});

app.post('/gameWinner', (req, res) => {
    const {name, side, bet, wallet} = req.body;
    if (name === null, side === null, bet === null, wallet === null) {
        res.json({'Please include the necessary body: {name, side, bet, wallet}': ''});
        return;
    }

    client.query('select * from Game where (p1_name = $1 and p1_side = $2 and p1_wallet = $3 and bet = $4) or (p2_name = $1 and p2_side = $2 and p1_wallet = $3 and bet = $4);', 
        [name, side, wallet, bet],
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
