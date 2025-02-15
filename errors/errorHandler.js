const errorHandler = (error, req, res, next) => {
  throw new Error(`LOGGER ERROR = ${error}`);
};

module.exports = errorHandler;
