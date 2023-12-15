function auth(req, res, next) {
    if(req.auth) {
        next();
    } else {
        res.render('login', {errMessage: `You must login to access ${req.originalUrl}`});
    }
}

module.exports = auth;
