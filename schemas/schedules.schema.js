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

const REMOVEITEMFROMSCHEDULE = Joi.object().keys({
  scheduleId: Joi.number().required(),
  day: Joi.number().required(),
  carId: Joi.number().required(),
  item: Joi.object().keys({
    id: Joi.number().required(),
    draggable_category_id: Joi.number().required(),
    name: Joi.string().required(),
    isActive: Joi.number().required(),
  }),
});

module.exports = {
  ADDNEWITEMTOSCHEDULE,
  REMOVEITEMFROMSCHEDULE,
};
