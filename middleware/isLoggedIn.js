function isLoggedIn(req, res, next)   {
    if(!req.isAuthenticated())  {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/signin");
    }
    next();
}

module.exports = {isLoggedIn};