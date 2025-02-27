const db = require('../services/db');
const config = require('../config');
const { ADDNEWITEMTOSCHEDULE } = require('../schemas/schedules.schema');

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
            return result?.[0]; // Fallback object
          }),
        );

        // Fetch regions
        const regions = await Promise.all(
          curr2.regions.split(',').map(async (region) => {
            const [result] = await db.query(
              `SELECT * FROM draggable_items WHERE id = ?`,
              [Number(region)],
            );
            return result?.[0]; // Fallback object
          }),
        );

        return {
          ...acc2,
          cars: {
            ...acc2.cars,
            [curr2.car]: { drivers, regions },
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
      scheduleId: currentSchedule?.[0]?.id,
      days: newObjByDayAndByCar,
    };

    res.status(200).json({ currentSchedule: newReturnedData });
  } catch (error) {
    next(error);
  }
};

const addDraggableItemInCurrentSchedule = async (req, res, next) => {
  try {
    console.log(req.body);
    const { value, error } = ADDNEWITEMTOSCHEDULE.validate(req.body);
    if (error) {
      res.status(500).json({ error });
      return false;
    }
    // const { password } = req.body;
    // const { user } = req.authData;
    // const salt = await bcrypt.genSalt();
    // const hashPassword = await bcrypt.hash(password, salt);
    // await db.query(
    //   `
    // UPDATE users SET password=? WHERE username=? AND isAdmin=?
    // `,
    //   [hashPassword, user, 0],
    // );
    // res.status(200).json({ message: 'Ο κωδικός σας άλλαξε.' });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Κάτι πήγε στραβά.' });
    next(error);
  }
};

module.exports = { getCurrentSchedule, addDraggableItemInCurrentSchedule };
