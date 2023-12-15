const jwt = require('jsonwebtoken');
const config = require('./../config');

function parseToken(req, res, next){
    if(req.cookies && req.cookies.token) {
        try {
           const payload = jwt.verify(req.cookies.token, config.secretkey);
           req.username = payload.username;
           req.role = payload.role;
           req.auth = true;
           next();
        } catch (error) {
            //log
            next();
        }
    } else next();
}

module.exports = parseToken;
