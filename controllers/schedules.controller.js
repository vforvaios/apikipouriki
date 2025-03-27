const db = require('../services/db');
const config = require('../config');
const {
  ADDNEWITEMTOSCHEDULE,
  REMOVEITEMFROMSCHEDULE,
} = require('../schemas/schedules.schema');

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

    const [latestSchedule] = await db.query(
      `
       SELECT id FROM schedules WHERE datesId=?
      `,
      [dateId],
    );

    const [currentSchedule] = await db.query(
      `
      SELECT 
          COALESCE(sd.scheduleId, sr.scheduleId) AS scheduleId,
          COALESCE(sd.carId, sr.carId) AS carId,
          COALESCE(sd.numberOfDay, sr.numberOfDay) AS numberOfDay,
          COALESCE(sd.draggableItemIds, '') AS drivers,
          COALESCE(sr.draggableItemIds, '') AS regions,
          COALESCE(sr.draggableItemIds_notDone, '') AS regionsNotDone
      FROM schedule_drivers sd
      LEFT JOIN schedule_regions sr 
          ON sd.scheduleId = sr.scheduleId 
          AND sd.carId = sr.carId 
          AND sd.numberOfDay = sr.numberOfDay
      WHERE sd.scheduleId = ?

      UNION

      SELECT 
          COALESCE(sd.scheduleId, sr.scheduleId) AS scheduleId,
          COALESCE(sd.carId, sr.carId) AS carId,
          COALESCE(sd.numberOfDay, sr.numberOfDay) AS numberOfDay,
          COALESCE(sd.draggableItemIds, '') AS drivers,
          COALESCE(sr.draggableItemIds, '') AS regions,
          COALESCE(sr.draggableItemIds_notDone, '') AS regionsNotDone
      FROM schedule_regions sr
      LEFT JOIN schedule_drivers sd 
          ON sr.scheduleId = sd.scheduleId 
          AND sr.carId = sd.carId 
          AND sr.numberOfDay = sd.numberOfDay
      WHERE sr.scheduleId = ?

      `,
      [latestSchedule?.[0]?.id, latestSchedule?.[0]?.id],
    );

    let newReturnedData = {};

    const newObjByDayAndByCar = await currentSchedule.reduce(async (accPromise, curr) => {
      const acc = await accPromise; // Wait for previous accumulator to resolve

      const filteredDays = currentSchedule
        .filter((day) => day.numberOfDay === curr.numberOfDay)
        .sort((a, b) => a.numberOfDay - b.numberOfDay);

      const carsData = await filteredDays.reduce(async (acc2Promise, curr2) => {
        const acc2 = await acc2Promise; // Wait for previous accumulator to resolve

        // Fetch drivers
        const drivers = await Promise.all(
          curr2.drivers.split(',').map(async (driver) => {
            const [result] = await db.query(
              `SELECT * FROM draggable_items WHERE id = ?`,
              [Number(driver)],
            );
            return result?.[0] ? result?.[0] : []; // Fallback object
          }),
        );

        // Fetch regions
        const regions = await Promise.all(
          curr2.regions.split(',').map(async (region) => {
            const [result] = await db.query(
              `SELECT * FROM draggable_items WHERE id = ?`,
              [Number(region)],
            );

            return result?.[0]
              ? {
                  ...result?.[0],
                  isDone: !curr2?.regionsNotDone
                    ?.split(',')
                    ?.map((i) => Number(i))
                    ?.includes(result?.[0]?.id),
                }
              : []; // Fallback object
          }),
        );

        return {
          ...acc2,
          cars: {
            ...acc2.cars,
            [curr2.carId]: { drivers: drivers?.flat(), regions: regions?.flat() },
          },
        };
      }, Promise.resolve({}));

      return {
        ...acc,
        [curr.numberOfDay]: carsData,
      };
    }, Promise.resolve({}));

    newReturnedData = {
      ...newReturnedData,
      scheduleId: currentSchedule?.[0]?.scheduleId,
      days: newObjByDayAndByCar,
    };

    res.status(200).json({ currentSchedule: newReturnedData });
  } catch (error) {
    next(error);
  }
};

const addDraggableItemInCurrentSchedule = async (req, res, next) => {
  try {
    const { value, error } = ADDNEWITEMTOSCHEDULE.validate(req.body);
    if (error) {
      res.status(500).json({ error });
      return false;
    }

    const {
      scheduleId,
      day,
      carId,
      item: { id, draggableCategory },
    } = req.body;
    const tableName = draggableCategory === 1 ? 'schedule_drivers' : 'schedule_regions';

    const [dayAndCarExistsInSchedule] = await db.query(
      `
      SELECT * FROM ${tableName} WHERE numberOfDay=? and scheduleId=? and carId=?
      `,
      [day, scheduleId, carId],
    );

    // IF NO RECORD EXISTS, THEN INSERT
    if (dayAndCarExistsInSchedule?.length === 0) {
      const sql =
        draggableCategory === 1
          ? 'INSERT INTO schedule_drivers(scheduleId, carId, numberOfDay, draggableItemIds) VALUES(?,?,?,?)'
          : 'INSERT INTO schedule_regions(scheduleId, carId, numberOfDay, draggableItemIds) VALUES(?,?,?,?)';
      await db.query(sql, [scheduleId, carId, day, id]);
    } else {
      // UPDATE THE EXISTING RECORD
      const sqlSelectExistingDraggableItems =
        draggableCategory === 1
          ? 'SELECT * FROM schedule_drivers WHERE numberOfday=? AND carId=? AND scheduleId=?'
          : 'SELECT * FROM schedule_regions WHERE numberOfday=? AND carId=? AND scheduleId=?';

      const [existingRecord] = await db.query(sqlSelectExistingDraggableItems, [
        day,
        carId,
        scheduleId,
      ]);

      const newDraggableItems = `${existingRecord?.[0]?.draggableItemIds},${id}`;

      const sqlUpdateExistingRecord =
        draggableCategory === 1
          ? 'UPDATE schedule_drivers SET draggableItemIds=? WHERE numberOfDay=? AND carId=? AND scheduleId=?'
          : 'UPDATE schedule_regions SET draggableItemIds=? WHERE numberOfDay=? AND carId=? AND scheduleId=?';

      await db.query(sqlUpdateExistingRecord, [
        `${newDraggableItems}`,
        day,
        carId,
        existingRecord?.[0]?.scheduleId,
      ]);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Κάτι πήγε στραβά.' });
    next(error);
  }
};

const removeDraggableItemFromCurrentSchedule = async (req, res, next) => {
  try {
    const { value, error } = REMOVEITEMFROMSCHEDULE.validate(req.body);
    if (error) {
      res.status(500).json({ error });
      return false;
    }

    const {
      day,
      scheduleId,
      carId,
      item: { id, draggable_category_id },
    } = req.body;
    console.log('id=', id);
    const existingRecordSql =
      draggable_category_id === 1
        ? 'SELECT * FROM schedule_drivers WHERE scheduleId=? AND numberOfDay=? AND carId=?'
        : 'SELECT * FROM schedule_regions WHERE scheduleId=? AND numberOfDay=? AND carId=?';

    const [existingRecord] = await db.query(existingRecordSql, [scheduleId, day, carId]);

    const existingItemsInRecord = existingRecord?.[0]?.draggableItemIds.split(',');

    const newItems = existingItemsInRecord
      ?.filter((itm) => Number(itm) !== Number(id))
      .map((idx) => Number(idx));
    console.log(newItems);

    const updateSql =
      draggable_category_id === 1
        ? newItems?.length
          ? 'UPDATE schedule_drivers SET draggableItemIds=? WHERE id=?'
          : 'DELETE FROM schedule_drivers WHERE id=?'
        : newItems?.length
        ? 'UPDATE schedule_regions SET draggableItemIds=? WHERE id=?'
        : 'DELETE FROM schedule_regions WHERE id=?';

    await db.query(
      updateSql,
      newItems?.length
        ? [newItems?.join(','), existingRecord?.[0]?.id]
        : [existingRecord?.[0]?.id],
    );
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Κάτι πήγε στραβά.' });
    next(error);
  }
};

module.exports = {
  getCurrentSchedule,
  addDraggableItemInCurrentSchedule,
  removeDraggableItemFromCurrentSchedule,
};
