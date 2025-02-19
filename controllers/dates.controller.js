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

const scheduleAdditionOfNewDates = async (req, res, next) => {
  try {
    const now = new Date();
    const [secondFridayOfTheTwoWeeks] = await db.query(
      `
        SELECT startDate2 
         FROM dates WHERE isActive=?
         ORDER BY id desc 
         LIMIT 1
        `,
      [1],
    );

    const lastMondayInDb = new Date(secondFridayOfTheTwoWeeks?.[0]?.startDate2);
    const temp = new Date(secondFridayOfTheTwoWeeks?.[0]?.startDate2);
    temp.setDate(temp.getDate() + 5);

    const firstUpcomingMonday = new Date(
      lastMondayInDb.setDate(lastMondayInDb.getDate() + 7),
    );
    const secondUpcomingMonday = new Date(
      lastMondayInDb.setDate(lastMondayInDb.getDate() + 7),
    );
    if (new Date(temp).getTime() <= now.getTime()) {
      await db.query(
        `INSERT INTO dates(startDate1, startDate2, isActive) VALUES(?,?,?)`,
        [firstUpcomingMonday, secondUpcomingMonday, 1],
      );
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(401).json({
      error,
    });
    next(error);
  }
};

module.exports = { getLastDates, scheduleAdditionOfNewDates };
