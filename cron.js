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

    console.log(
      new Date(secondFridayOfTheTwoWeeks?.[0]?.startDate2).toLocaleDateString(),
    );
    console.log(now.toLocaleDateString());
  } catch (error) {
    console.log(error);
  }
};
// Running the job at 00:01 AM Greece time
cron.schedule(
  //   '1 0 * * *',
  '* * * * *',
  () => {
    scheduleAdditionOfNewDates();
  },
  {
    scheduled: true,
    timezone: 'Europe/Athens',
  },
);
