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
        SELECT distinct s.id, s.datesId, 
               sd.carId as car, sd.numberOfDay, sd.draggableItemIds as drivers, 
               sr.draggableItemIds as regions
        FROM schedules s
        INNER JOIN schedule_drivers sd ON sd.scheduleId = s.id
        INNER JOIN schedule_regions sr ON sr.scheduleId = s.id
        WHERE datesId=?
        `,
      [dateId],
    );

    let drivers = [];
    let regions = [];
    const getAllRelevantDrivers = currentSchedule.map(async (sched, index) => {
      const [itmDrivers] = await db.query(
        `
          SELECT * FROM draggable_items WHERE id IN (${sched.drivers
            .split(',')
            ?.map((reg) => reg.toString())
            .join()})`,
      );

      drivers.push(...itmDrivers);
    });

    const getAllRelevantRegions = currentSchedule.map(async (sched, index) => {
      const [itmRegions] = await db.query(
        `
          SELECT * FROM draggable_items WHERE id IN (${sched.regions
            .split(',')
            ?.map((reg) => reg.toString())
            .join()})`,
      );
      regions.push(...itmRegions);
    });

    await Promise.all(getAllRelevantDrivers);
    await Promise.all(getAllRelevantRegions);

    const newCurrentSchedule = currentSchedule.map((currSched) => {
      const currDrivers = currSched.drivers.split(',').map((itm) => Number(itm));
      const currRegions = currSched.regions.split(',').map((itm) => Number(itm));
      return {
        ...currSched,
        drivers: Array.from(new Set(drivers.map((obj) => JSON.stringify(obj))))
          .map((e) => JSON.parse(e))
          .filter((dr) => currDrivers.includes(dr.id)),
        regions: Array.from(new Set(regions.map((obj) => JSON.stringify(obj))))
          .map((e) => JSON.parse(e))
          .filter((dr) => currRegions.includes(dr.id)),
      };
    });

    res.status(200).json({ currentSchedule: newCurrentSchedule });
  } catch (error) {}
};

module.exports = { getCurrentSchedule };
