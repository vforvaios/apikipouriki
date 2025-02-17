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
      `SELECT username, password, isActive FROM users WHERE username=? AND isActive=?`,
      [username, 1],
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
      res.status(401).json({
        error: 'Ο χρήστης σας είναι απενεργοποιημένος. Παρακαλώ επικοινωνήστε μαζί μας.',
      });
    }
  } catch (error) {
    res.status(401).json({
      error,
    });
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    console.log(req.body);
    const { password, username } = req.body;

    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);

    const sql = `INSERT INTO users(username, password, isActive) VALUES (?,?,?)`;
    await db.query(sql, [username, hashPassword, 1]);

    res.status(200).json({ message: 'Η εγγραφή ολοκληρώθηκε επιτυχώς!' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = { loginUser, registerUser };
