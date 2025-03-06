const Joi = require('joi');

const ADDDRAGGABLEITEMSCHEMA = Joi.object().keys({
  name: Joi.string().required(),
  draggable_category_id: Joi.number().required(),
  isActive: Joi.number().required(),
  type: Joi.string().required(),
});

module.exports = {
  ADDDRAGGABLEITEMSCHEMA,
};
