const db = require('../services/db');
require('dotenv').config();

const getCurrentSchedule = async (req, res, next) => {
  try {
    const [currentDates] = await db.query(
      `SELECT id, startDate1, startDate2, isActive 
           FROM dates WHERE isActive=?
           ORDER BY id desc 
           LIMIT 1`,
      [1],
    );

    const dateId = currentDates?.[0]?.id;

    const [currentSchedule] = await db.query(
      `
        SELECT s.id, s.datesId, 
               sd.carId as car, sd.numberOfDay, sd.draggableItemIds as drivers, 
               sr.draggableItemIds as regions
        FROM schedules s
        INNER JOIN schedule_drivers sd ON sd.scheduleId = s.id
        INNER JOIN schedule_regions sr ON sr.scheduleId = s.id
        WHERE datesId=?
        `,
      [dateId],
    );

    res.status(200).json({ currentSchedule });
  } catch (error) {}
};

module.exports = { getCurrentSchedule };
