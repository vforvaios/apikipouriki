const db = require('../services/db');
require('dotenv').config();

const getLastDates = async (req, res, next) => {
  try {
    const [dates] = await db.query(
      `SELECT id, startDate1, startDate2, isActive 
       FROM dates WHERE isActive=?
       ORDER BY id desc 
       LIMIT 1`,
      [1],
    );

    res.status(200).json({
      dates,
    });
  } catch (error) {
    res.status(401).json({
      error,
    });
    next(error);
  }
};

module.exports = { getLastDates };
