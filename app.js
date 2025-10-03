const express = require('express');
const path = require('path');
const pgp = require('pg-promise')();

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

// db connection using 'pg-promise'
const cn = {
    host: 'localhost',
    port: PORT,
    database: 'gymlog',
    user: 'gymlog_admin',
    password: 'gymlog_admin',
    max: 30
};

const db = pgp(cn);

app.use(express.static('public'));
app.use(express.urlencoded({extended : true})); 

app.get('/', (req, res) => {
    res.send("gymlog home page", req);
})

app.post('/submit', (req, res) => {
    // server-side form validation

    console.log(req.body);
    res.send("workout received");
})

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
    } else {
        console.log("ERROR", error);
    }
});





