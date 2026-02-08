import express from 'express';
import { body, validationResult, matchedData } from 'express-validator'; 
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import nunjucks from 'nunjucks';
import * as db from './db/index.js';

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 
A file is statically served when it is not altered by the server. 
form.html is only changed by the /css/form.js which is provided directly to the browser. 
Static files may still request data from the db, but may not explicitly access it. 
*/
app.use(express.static(path.join(__dirname, 'public'))); 

/*
Views are templates that a template engine (on the server-side) 
will modify before sending the final html file to the browser for display. 
*/
nunjucks.configure(path.join(__dirname, 'views'), { 
    autoescape: true,
    express: app
}); 

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
        maxAge: 600000, // cookie lifetime = 1 min 
    },
}));

function authenticated (req, res, next) {
    if (req.session.userId)  next(); // 'user' field will be empty if not authenticated
    else next('route'); // jump to nearest middleware w/ matching route
} 

/*
req, res objects in Express: 
req, res objects are representations of the HTTP request and response.
They are not the actual HTTP requests received / HTTP responses given out. 
Thus after their scope ends (i.e. goes through all middlewares), they are 
destroyed through garbage collection. 
*/

app.get('/', authenticated, (req, res) => {
    // only executes for authenticated user's requests 
    res.redirect('/dashboard');
});

app.get('/', (req, res) => {
    // redirects unauthenticated clients to login
    res.redirect('login');
})

app.get('/login', (req, res) => {
    res.render('login.html'); 
    // Mistake: setting render path to /login/ + ... will treat the root directory as __dirname + /login which does not exist. 
})

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const verified = await db.verifyUser(username, password);
    
    if (verified) {
        const result = await db.getUserId(username, password); 
        req.session.userId = result.rows[0].user_id; // assigns the user to the session object
        req.session.save(function(err) { // saves changes made to the session object (added user) for future use
            if (err) return next(err);
            res.redirect('/'); // redirects authorized user the page containing personalized workout data
        })
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to logout');
        }
        res.redirect('/login'); // Redirect to login after logout
      }
)})

app.get('/signup', (req, res) => {
    res.render('signup.html')
});

app.post('/signup', async (req, res) => {
    console.log("signup request")
    const username = req.body.username;
    const password = req.body.password;

    try {
        const created = await db.addUser(username, password);
    } catch (err) {
        // template engine to dynamically modify html to guide users through errors
        // red text saying "this username is already in use"
        if (err.name == "ExistingUserError") {
            var data = { userExists: true }; 
            return res.render('signup.html', data);
            /*
            Mistake: Simply calling res.render and NOT RETURNING it will not stop execution causing the 
            res.redirect call below will also be executed which is not allowed because it sets the header twice. 
            */
        }
    }

    // upon succesful signup, direct users back to login page 
    res.redirect('/login'); 
});

app.get('/submit', authenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'form.html')); 
});

app.post('/submit', authenticated,
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

app.get('/dashboard', authenticated, async (req, res) => {
    res.render("log.html");
})


app.get('/api/load-workouts', authenticated, async (req, res) => {
    console.log("req.session.userId = " + req.session.userId); 
    const result = await db.getPrevWorkouts(req.session.userId, -1); // pg.Result object
    console.log(result);
    return res.status(200).json(({result: result})); 
});

// Deletes a workout from the database 
app.delete('/api/workout/:workoutId', authenticated, async (req, res) => {
    // retrieve id of workout to be deleted from the request body?
    const workoutId = req.params.workoutId;
    console.log(`Received DELETE request for workout (id: ${workoutId})`);
    const result = await db.deleteWorkout(workoutId); 

    return res.sendStatus(204); 
});

app.patch('/api/workout/:workoutId', authenticated, async (req, res) => {
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
