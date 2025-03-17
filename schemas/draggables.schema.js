const Joi = require('joi');

const ADDDRAGGABLEITEMSCHEMA = Joi.object().keys({
  name: Joi.string().required(),
  draggable_category_id: Joi.number().required(),
  isActive: Joi.number().required(),
  type: Joi.string().required(),
  regionCategory: Joi.number().allow(null, 0),
});

const EDITDRAGGABLEITEMSCHEMA = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().required(),
  draggable_category_id: Joi.number().required(),
  isActive: Joi.number().required(),
  type: Joi.string().required(),
  regionCategory: Joi.number().allow(null, 0),
});

module.exports = {
  ADDDRAGGABLEITEMSCHEMA,
  EDITDRAGGABLEITEMSCHEMA,
};
