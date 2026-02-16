import express from 'express';
import * as db from '../db/index.js';

const authRouter = express.Router();

authRouter.get('/login', (req, res) => {
    res.render('login.html'); 
    // Mistake: setting render path to /login/ + ... will treat the root directory as __dirname + /login which does not exist. 
})

authRouter.post('/login', async (req, res) => {
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

authRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to logout');
        }
        res.redirect('/auth/login'); // Redirect to login after logout
      }
)})

authRouter.get('/signup', (req, res) => {
    res.render('signup.html')
});

authRouter.post('/signup', async (req, res) => {
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

    res.redirect('/login'); 
});

export default authRouter;