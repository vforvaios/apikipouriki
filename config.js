const config = {
  numberOfDaysInEachWeek: 6,
  db: {
    /* don't expose password or any sensitive info, done only for demo */
    // connectionLimit: 7,
    host: `${process.env.HOST}`,
    port: 3306,
    user: `${process.env.DBUSER}`,
    password: `${process.env.PASSWORD}`,
    database: `${process.env.DBNAME}`,
    multipleStatements: false,
    // debug: true,
    connectionLimit: 50,
    // acquireTimeout: 100000,
    connectTimeout: 10000,
  },
  catalogSorting: {
    1: ' ASC ',
    2: ' DESC ',
  },
  orderSorting: {
    1: ' ASC ',
    2: ' DESC ',
  },
  imageUrl: 'http://tierra-api.vforvaios.gr/images/',
  recordsPerPage: 12,
  messages: {
    error: 'Wrong data',
  },
};

module.exports = config;
