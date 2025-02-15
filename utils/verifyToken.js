const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  // get auth header value
  const bearerToken = req.headers['authorization'];
  if (bearerToken) {
    const brToken = bearerToken.split(' ')[1];

    jwt.verify(brToken, process.env.API_SECRET_KEY || '', (err, authData) => {
      if (err) {
        // unauthorized
        res.status(401).json({ error: 'Το token έληξε. Παρακαλώ κάντε ξανά login.' });
        next(err);
      } else {
        // set the token
        req.token = brToken;
        req.authData = authData;
        next();
      }
    });
  } else {
    //   forbidden
    res.sendStatus(403);
  }
};

module.exports = verifyToken;
