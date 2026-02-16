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

import authRouter from './routes/auth.js';
import pagesRouter from './routes/pages.js';
import workoutsRouter from './routes/workouts.js';

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

app.use('/auth', authRouter);
app.use('/workouts', workoutsRouter);
app.use('/', pagesRouter);

/*
req, res objects in Express: 
req, res objects are representations of the HTTP request and response.
They are not the actual HTTP requests received / HTTP responses given out. 
Thus after their scope ends (i.e. goes through all middlewares), they are 
destroyed through garbage collection. 
*/

app.listen(PORT, (error) => {
    if (!error) {
        console.log(`server running on http://localhost:${PORT}`);
        console.log(__dirname);
    } else {
        console.error(error.message);
    }
});
