import express from 'express';
import dayjs from 'dayjs'
import path from 'path';
import { body, validationResult, matchedData } from 'express-validator'; 
import { fileURLToPath } from 'url';
import * as db from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workoutsRouter = express.Router();

function authenticated (req, res, next) {
    if (req.session.userId)  {
        next();
    } // 'user' field will be empty if not authenticated
    else {
        next('route');
    } // jump to nearest middleware w/ matching route
} 

workoutsRouter.get('/load-workouts', authenticated, async (req, res) => {
    const result = await db.getPrevWorkouts(req.session.userId, -1); // pg.Result object
    return res.status(200).json(({result: result})); 
});

workoutsRouter.get('/submit', authenticated, (req, res) => {
    res.render('form.html'); 
});

workoutsRouter.post('/submit', authenticated,
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
            db.addWorkout(req.session.userId, dayjs(data.date).format('YYYY-MM-DD'), data.split, data); 

            // returns to home page
            res.redirect('/dashboard');
        } else {
            // Error 
            return res.status(422).json( { errors: result.array() });
        }      
});

workoutsRouter.get('/:workoutId', authenticated, async (req, res) => {
    // retrieve id of workout to be deleted from the request body?
    const workoutId = req.params.workoutId;
    const result = await db.getWorkoutById(req.session.userId, workoutId); 
    return res.status(200).json( { result: result }); 
});

// Deletes a workout from the database 
workoutsRouter.delete('/:workoutId', authenticated, async (req, res) => {
    // retrieve id of workout to be deleted from the request body?
    const workoutId = req.params.workoutId;
    const result = await db.deleteWorkout(workoutId); 

    return res.sendStatus(204); 
});

workoutsRouter.get('/edit/:workoutId', authenticated, async (req, res) => {
    const result = await db.getWorkoutById(req.session.userId, req.params.workoutId);
    
    var date = new Date(result.date); // Format date before passing it to the view 
    result.date = date.toISOString().split("T")[0]; 

    console.log({result: result});
    return res.render('editing_form.html', {result: result}); 
});

workoutsRouter.post('/edit/:workoutId', authenticated, 
    [
        body('date')
            .notEmpty().withMessage('Date cannot be empty'),
        body('split')
            .optional(),
        body('exercise.*.name')
            .isLength({ min: 1, max: 20}).withMessage('exercise must be between 1 and 20 characters')
            .matches(/^[A-Za-z ]+$/).withMessage('exercise name can only contain letters and spaces'),
        body('exercise.*.sets.*.weight')
            .notEmpty().withMessage('weight cannot be empty')
            .isFloat({ min: 0.1, max: 999}).withMessage('weight must be a number'), 
        body('exercise.*.sets.*.reps')
            .notEmpty().withMessage('reps cannot be empty')
            .isFloat({ min: 0.1, max: 999 }).withMessage('reps must be a number'),
    ],
    async (req, res) => {
        console.log("received PATCH request");
        const validation = validationResult(req);

        if (validation.isEmpty()) {
            const data = matchedData(req);
            const result = await db.editWorkout(req.params.workoutId, dayjs(data.date), data.split, data); 

            res.redirect('/dashboard');
        } else {
            return res.status(422).json( { errors: validation.array() });
        }
})

export default workoutsRouter;