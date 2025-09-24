const { body, validationResult } = require("express-validator");

const express = require('express');
const path = require('path');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;


app.use(express.static('public'));

app.get('/', (req, res, next) => {
    res.send("gymlog home page", req);
});

app.get('/submit', (req, res)) {

}

app.post('/submit', (req, res)) {

}

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
    } else {
        console.log("ERROR", error);
    }
});





