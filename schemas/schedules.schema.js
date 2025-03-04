const Joi = require('joi');

const ADDNEWITEMTOSCHEDULE = Joi.object().keys({
  scheduleId: Joi.number().required(),
  day: Joi.number().required(),
  carId: Joi.number().required(),
  item: Joi.object().keys({
    id: Joi.number().required(),
    draggableCategory: Joi.number().required(),
    name: Joi.string().required(),
  }),
});

module.exports = {
  ADDNEWITEMTOSCHEDULE,
};
