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

app.get('/', (req, res) => {});

app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form', 'formIndex.html'));
});

// POST /submit
app.post('/submit', 
    // server-side form validation using express-validator
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
        // if isEmpty returns true, then the result object has no errors. 
        if (result.isEmpty()) {
            const data = matchedData(req);
            console.log(data);
            db.addWorkout(null, data.date, data.split, data); 

            // returns to home page
            res.redirect('/');
        } else {
            // Error 
            return res.status(422).json( { errors: result.array() });
        }      
});

// GET /api/load-workouts
app.get('/api/load-workouts', async (req, res) => {
    const result = await db.getPrevWorkouts(null, -2); 
    return res.status(200).json({result: result}); 
});

// DELETE /api/delete-workout
// Deletes a workout from the database 
app.delete('/api/workout/:workoutId', async (req, res) => {
    // retrieve id of workout to be deleted from the request body?
    const workoutId = req.params.workoutId;
    console.log(`Received DELETE request for workout (id: ${workoutId})`);
    const result = await db.deleteWorkout(workoutId); 

    return res.sendStatus(204); 
});

app.patch('/api/workout/:workoutId', async (req, res) => {
    const workoutId = req.params.workoutId;
    const result = await editWorkout(workoutId); 
})

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
        console.log(__dirname);
    } else {
        console.error(error.message);
    }
});
