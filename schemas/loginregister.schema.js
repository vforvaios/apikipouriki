const Joi = require('joi');
const LOGINSCHEMA = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = {
  LOGINSCHEMA,
};
