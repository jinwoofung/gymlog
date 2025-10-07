import { Pool } from 'pg';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, validationResult, matchedData } = require('express-validator');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

// db initialization
const pool = new Pool({
    host: 'localhost',
    user: 'gymlog_admin',
    password: 'gymlog_admin',
    database: 'gymlog',
    port: 5432, 
    idleTimeoutMillis: 30000,
});

const initDb = fs.readFileSync('init_db.sql'); 
const client = await pool.connect(); 
const res = client.query(initDb); 
console.log("db init complete"); 

// db operation functions
function insertWorkout(user_id, date, split, workout_detail) {
    pool.query('INSERT INTO workouts (user_id, date, split, workout_details) VALUES ($1, $2, $3, $4)', 
        [user_id, date, split, workout_detail]); 
}

function editWorkout(workout_id, date, split, workout_detail) {}

function deleteWorkout(workout_id) {}


// http action
app.use(express.static('public'));
app.use(express.urlencoded({extended : true})); 

app.get('/', (req, res) => {
    res.send("gymlog home page", req);
});

app.post('/submit', 
    // server-side form validation
    [
        body('date')
            .notEmpty().withMessage('date cannot be empty'),
        body('exercises.exercise[0-9]*.name')
            .isLength({ min: 1, max: 20}).withMessage('exercise must be between 1 and 20 characters'),
        body('exercises.*.*.weight')
            .notEmpty().withMessage('weight cannot be empty')
            .isFloat({ min: 0.1, max: 999}).withMessage('weight must be a number'), // might not allow decimal nums
        body('exercises.*.*.reps')
            .notEmpty().withMessage('reps cannot be empty')
            .isFloat({ min: 0.1, max: 999 }).withMessage('reps must be a number'),
    ],
    (req, res) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const data = matchedData(req);
            console.log(req.body);
            insertWorkoutToDb(user_id, data.date, data.split, data.exercises);
            res.send("workout received");
        } else {
            // Error 
            return res.status(422).json({ errors: result.array() });
        }      
});

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
    } else {
        console.log("ERROR", error);
    }
});





