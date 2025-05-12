const config = require('../config');
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

const getDatesByScheduleId = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const [datesId] = await db.query(
      `
      SELECT datesId FROM schedules WHERE id=?
      `,
      [scheduleId],
    );

    const [dates] = await db.query(
      `SELECT id, startDate1, startDate2, isActive 
       FROM dates WHERE id=?
       `,
      [datesId?.[0]?.datesId],
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

// THIS IS THE CRON JOB UPDATING THE DATES OF THE UPCOMING SCHEDULE
const scheduleAdditionOfNewDates = async (req, res, next) => {
  let conn = await db.getConnection();
  try {
    const now = new Date();

    const [currentScheduleId] = await conn.query(
      `
        SELECT id FROM schedules WHERE isDefault=?
      `,
      [1],
    );

    const [secondFridayOfTheTwoWeeks] = await conn.query(
      `
        SELECT id, startDate2 
         FROM dates WHERE isActive=?
        `,
      [1],
    );

    const lastMondayInDb = new Date(secondFridayOfTheTwoWeeks?.[0]?.startDate2);
    const temp = new Date(secondFridayOfTheTwoWeeks?.[0]?.startDate2);
    temp.setDate(temp.getDate() + config.numberOfDaysInEachWeek);

    const firstUpcomingMonday = new Date(
      lastMondayInDb.setDate(lastMondayInDb.getDate() + 7),
    );
    const secondUpcomingMonday = new Date(
      lastMondayInDb.setDate(lastMondayInDb.getDate() + 7),
    );

    if (new Date(temp).getTime() <= now.getTime()) {
      await conn.query(
        `
        UPDATE dates SET isActive=? WHERE id=?
        `,
        [0, secondFridayOfTheTwoWeeks?.[0]?.id],
      );
      const [
        datesRecord,
      ] = await conn.query(
        `INSERT INTO dates(startDate1, startDate2, isActive) VALUES(?,?,?)`,
        [firstUpcomingMonday, secondUpcomingMonday, 1],
      );

      const lastInsertedDatesId = datesRecord.insertId;

      const [insertIntoScheduleTable] = await conn.query(
        `
          INSERT INTO schedules(datesId) VALUES(?)
        `,
        [lastInsertedDatesId],
      );
      // res.sendStatus(200);
      // return false;

      const lastInsertedScheduleId = insertIntoScheduleTable.insertId;
      // INSERT BATCH RECORDS TO SCHEDULE_DRIVERS TABLE
      const [
        rowsToBeCopiedToScheduleDrivers,
      ] = await conn.query(`SELECT * FROM schedule_drivers WHERE scheduleId = ?`, [
        currentScheduleId?.[0]?.id,
      ]);

      const insertQueryIntoScheduleDrivers =
        'INSERT INTO schedule_drivers (scheduleId, carId, numberOfDay, draggableItemIds) VALUES ?';

      const valuesToBeInsertedToScheduleDrivers = rowsToBeCopiedToScheduleDrivers.map(
        (row) => {
          const { carId, numberOfDay, draggableItemIds } = row;
          return [lastInsertedScheduleId, carId, numberOfDay, draggableItemIds];
        },
      );

      await conn.query(insertQueryIntoScheduleDrivers, [
        valuesToBeInsertedToScheduleDrivers,
      ]);

      // INSERT BATCH RECORDS TO SCHEDULE_REGIONS TABLE
      const [
        rowsToBeCopiedToScheduleRegions,
      ] = await conn.query(`SELECT * FROM schedule_regions WHERE scheduleId = ?`, [
        currentScheduleId?.[0]?.id,
      ]);

      const insertQueryIntoScheduleRegions =
        'INSERT INTO schedule_regions (scheduleId, carId, numberOfDay, draggableItemIds) VALUES ?';

      const valuesToBeInsertedToScheduleRegions = rowsToBeCopiedToScheduleRegions.map(
        (row) => {
          const { carId, numberOfDay, draggableItemIds } = row;
          return [lastInsertedScheduleId, carId, numberOfDay, draggableItemIds];
        },
      );

      await conn.query(insertQueryIntoScheduleRegions, [
        valuesToBeInsertedToScheduleRegions,
      ]);

      await conn.commit();
    }

    res.sendStatus(200);
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

module.exports = { getLastDates, getDatesByScheduleId, scheduleAdditionOfNewDates };
