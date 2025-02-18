require('dotenv').config();
const cron = require('node-cron');
const db = require('./services/db');

const scheduleAdditionOfNewDates = async () => {
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
  } catch (error) {
    console.log(error);
  }
};
// Running the job at 00:01 AM Greece time
cron.schedule(
  // '1 0 * * *',
  '* * * * *',
  () => {
    scheduleAdditionOfNewDates();
  },
  {
    scheduled: true,
    timezone: 'Europe/Athens',
  },
);
