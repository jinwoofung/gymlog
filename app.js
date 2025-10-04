const express = require('express');
const path = require('path');
const pgp = require('pg-promise')();

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

// db integration using 'pg-promise'
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'gymlog',
    user: 'gymlog_admin',
    password: 'gymlog_admin',
    max: 30
};

const db = pgp(cn);

function insertWorkoutToDb(user_id, date, split, workout_detail) {
    db.one('INSERT INTO workouts (user_id, date, split, workout_details) VALUES ($1, $2, $3, $4)', 
        [user_id, date, split, workout_detail])
        .then(() => {
            console.log("workout inserted into db");
        })
        .catch((error) => {
            console.log('ERROR', error);
        });
}

app.use(express.static('public'));
app.use(express.urlencoded({extended : true})); 

app.get('/', (req, res) => {
    res.send("gymlog home page", req);
});

app.post('/submit', (req, res) => {
    // server-side form validation

    console.log(req.body);
    res.send("workout received");
});

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
    } else {
        console.log("ERROR", error);
    }
});





