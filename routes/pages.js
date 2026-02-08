import express from 'express'; 

const pagesRouter = express.Router();

// perhaps seperate this function into a module
function authenticated (req, res, next) {
    if (req.session.userId)  next(); // 'user' field will be empty if not authenticated
    else next('route'); // jump to nearest middleware w/ matching route
} 

pagesRouter.get('/', authenticated, (req, res) => {
    // only executes for authenticated user's requests 
    res.redirect('/dashboard');
});

pagesRouter.get('/', (req, res) => {
    // redirects unauthenticated clients to login
    res.redirect('/auth/login');
})

pagesRouter.get('/dashboard', authenticated, async (req, res) => {
    res.render("log.html");
})

export default pagesRouter;