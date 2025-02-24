const db = require('../services/db');
require('dotenv').config();

const getAllActiveCars = async (req, res, next) => {
  try {
    const [allActiveCars] = await db.query(
      `
        SELECT *
        FROM cars
        WHERE isActive=?    
    `,
      [1],
    );

    res.status(200).json({
      cars: allActiveCars,
    });
  } catch (error) {
    res.status(401).json({
      error,
    });
    next(error);
  }
};

module.exports = { getAllActiveCars };
