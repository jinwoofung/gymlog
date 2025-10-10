import express from 'express';
import { body, validationResult, matchedData } from 'express-validator'; 
import { fileURLToPath } from 'url';
import path from 'path';
import * as db from './db/index.js';

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// http action
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended : true})); 

app.get('/', (req, res) => {

});

app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form', 'formIndex.html'));
});

app.post('/submit', 
    // server-side form validation
    [
        body('date')
            .notEmpty().withMessage('date cannot be empty'),
        body('split')
            .optional(),
        body('exercises.*.name')
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
            console.log(data);
            db.addWorkout(null, data.date, data.split, data);
            res.send("workout received");
        } else {
            // Error 
            return res.status(422).json( { errors: result.array() });
        }      
});

// frontend fetches previous workouts
app.get('/api/workouts', async (req, res) => {
    const result = await db.getPrevWorkouts(null, -1); 
    res.status(400).json({ length: result.rowCount, rows: result.rows }); 
})

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
        console.log(__dirname);
    } else {
        console.log(error);
    }
});
