function authorize(role) {
    return (req, res, next) => {
        if (req.role === role) {
            next();
        } else {
            res.render('login', { errMessage: `You must login with ${role} role to access ${req.originalUrl}` });
        }
    }
}

module.exports = authorize;
