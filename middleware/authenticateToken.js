const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // if there isn't any token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // if the token is not valid
    }

    req.user = user; // Add the user payload to the request
    next(); // Pass the execution off to whatever request the client intended
  });
}

module.exports = authenticateToken;
