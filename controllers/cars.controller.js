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

const updateAllCars = async (req, res, next) => {
  let conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const cars = req.body;

    const response = cars.map(async (car) => {
      await conn.query(
        `
        UPDATE cars SET name=? WHERE id=?
        `,
        [car.name, car.id],
      );
    });

    await Promise.all(response);

    await conn.commit();

    res.status(200).json({ message: 'Όλες οι αλλαγές σας αποθηκεύτηκαν' });
  } catch (error) {
    await conn.rollback();
    res.status(401).json({
      error,
    });
    next(error);
  } finally {
    conn.release();
  }
};

module.exports = { getAllActiveCars, updateAllCars };
