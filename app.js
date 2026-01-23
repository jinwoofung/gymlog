import express from 'express';
import { body, validationResult, matchedData } from 'express-validator'; 
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import * as db from './db/index.js';

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({extended : true})); 

// session middleware
app.use(session({
    secret: 'cookie cutter', // signs the sessionId 
    saveUninitialized: false, 
    /* 
    setting 'saveUnintialized = false' allows for the login system to be 
    implemented because the sessionId cannot be used for 
    authentication until it is saved (i.e. user logs in succesfully) 
    */ 

    resave: false, 

    /*
    note: clients stores the server-provided sessionId 
    in cookies with the name 'connect.sid'
    */
    cookie: { 
        maxAge: 60000, // cookie lifetime = 1 min 
    },
}));

function authenticated (req, res, next) {
    if (req.session.user)  next(); // 'user' field will be empty if not authenticated
    else next('route'); // jump to nearest middleware w/ matching route
}

app.get('/', authenticated, (req, res) => {
    // only executes for authenticated user's requests 
    res.sendFile(path.join(__dirname, 'public/'));
});

app.get('/', (req, res) => {
    // redirects unauthenticated clients to login
    res.redirect('login');
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login/'))
})

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const verified = await db.verifyUser(username, password);
    
    if (verified) {
        req.session.user = username; // assigns the user to the session object
        req.session.save(function(err) {
            if (err) return next(err);
            res.redirect('/');
        })
    }

    res.status(401).send('Invalid username or password');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to logout');
        }
        res.redirect('/login'); // Redirect to login after logout
      }
)})

app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form', 'formIndex.html'));
});

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


app.get('/api/load-workouts', async (req, res) => {
    const result = await db.getPrevWorkouts(null, -2); 
    return res.status(200).json({result: result}); 
});

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
