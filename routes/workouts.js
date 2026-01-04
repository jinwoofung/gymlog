import express from 'express';
import * as db from '../db/index.js';
import { body, validationResult, matchedData } from 'express-validator'; 

const router = express.Router();

// Returns previous workout data for display. 
router.get('/', async (req, res) => {
    console.log('Received request to get previous workout...')
    const result = await db.getPrevWorkouts(null, -2); 
    return res.status(200).json({result: result}); 
});


router.post('/', 
    // server-side form validation (express-validator)
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
            return res.status(422).json( { errors: result.array() });
        }      
});

router.delete('/:workoutId', async (req, res) => {
    const workoutId = req.params.workoutId;
    console.log(`Received DELETE request for workout (id: ${workoutId})`);
    const result = await db.deleteWorkout(workoutId); 

    return res.sendStatus(204); 
});

// Edits workout data that is already stored in the db.
router.patch('/:workoutId', async (req, res) => {
    const workoutId = req.params.workoutId;
    const result = await editWorkout(workoutId); 
})

export default router;