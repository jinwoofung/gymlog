import express from 'express';
import path from 'path';
import { body, validationResult, matchedData } from 'express-validator'; 
import { fileURLToPath } from 'url';
import * as db from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workouts = express.Router();

workouts.use(express.static('../public/')); // need to generalize this for any file structure

function authenticated (req, res, next) {
    if (req.session.userId)  next(); // 'user' field will be empty if not authenticated
    else next('route'); // jump to nearest middleware w/ matching route
} 

workouts.get('/load-workouts', authenticated, async (req, res) => {
    const result = await db.getPrevWorkouts(req.session.userId, -1); // pg.Result object
    console.log(result);
    return res.status(200).json(({result: result})); 
});

workouts.get('/submit', authenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'form.html')); 
});

workouts.post('/submit', authenticated,
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
            db.addWorkout(req.session.userId, data.date, data.split, data); 

            // returns to home page
            res.redirect('/dashboard');
        } else {
            // Error 
            return res.status(422).json( { errors: result.array() });
        }      
});

// Deletes a workout from the database 
workouts.delete('/:workoutId', authenticated, async (req, res) => {
    // retrieve id of workout to be deleted from the request body?
    const workoutId = req.params.workoutId;
    console.log(`Received DELETE request for workout (id: ${workoutId})`);
    const result = await db.deleteWorkout(workoutId); 

    return res.sendStatus(204); 
});

workouts.patch('/:workoutId', authenticated, async (req, res) => {
    const workoutId = req.params.workoutId;
    const result = await db.editWorkout(workoutId); 
})

export default workouts;