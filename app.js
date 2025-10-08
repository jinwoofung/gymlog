import express from 'express';
import { body, validationResult, matchedData } from 'express-validator'; 
import * as db from './db/index.js';

const app = express();
const PORT = process.env.PORT || 8080;

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
        body('exercises.[0-9]*.name')
            .isLength({ min: 1, max: 20}).withMessage('exercise must be between 1 and 20 characters')
            .matches(/^[A-Za-z ]+$/).withMessage('exercise name can only contain letters and spaces'),
        body('exercises.*.sets.*.weight')
            .notEmpty().withMessage('weight cannot be empty')
            .isFloat({ min: 0.1, max: 999}).withMessage('weight must be a number'), 
        body('exercises.*.sets.*.reps')
            .notEmpty().withMessage('reps cannot be empty')
            .isFloat({ min: 0.1, max: 999 }).withMessage('reps must be a number'),
    ],
    (req, res) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const data = matchedData(req);
            console.log(req.body);
            // insertWorkoutToDb(user_id, data.date, data.split, data.exercises);
            res.send("workout received");
        } else {
            // Error 
            return res.status(422).json( { errors: result.array() });
        }      
});

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
    } else {
        console.log(error);
    }
});
