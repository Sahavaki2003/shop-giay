const jwt = require("jsonwebtoken");
const config = require("./../config");

function parseToken(req, res, next) {
  if (req.cookies && req.cookies.token) {
    try {
      const payload = jwt.verify(req.cookies.token, config.secretkey);
      console.log("payload", payload);
      req.username = payload.username;
      req.id = payload.id;
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
