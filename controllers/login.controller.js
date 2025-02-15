const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../services/db');
const config = require('../config');
const { LOGINSCHEMA } = require('../schemas/loginregister.schema');
require('dotenv').config();

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { value, error } = LOGINSCHEMA.validate(req.body);

    if (error) {
      res.status(500).json({ error: config.messages.error });
      return false;
    }

    const [
      userInDb,
    ] = await db.query(
      `SELECT username, password, isActive FROM users WHERE email=? AND isAdmin=?`,
      [username, 0],
    );

    if (!userInDb?.[0]?.isActive) {
      res.status(401).json({
        error: 'Ο χρήστης σας είναι απενεργοποιημένος. Παρακαλώ επικοινωνήστε μαζί μας.',
      });
      return false;
    }

    const userExists = await bcrypt.compare(password, userInDb[0].password);

    if (userExists) {
      const user = userInDb[0].username;

      jwt.sign(
        { user },
        process.env.API_SECRET_KEY || '',
        { expiresIn: '1h' },
        (err, token) => {
          res.status(200).json({
            userLoggedIn: { username: user },
            token,
          });
        },
      );
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.sendStatus(401);
    next(error);
  }
};

module.exports = { loginUser };
