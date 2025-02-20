const express = require('express');
const DraggableItems = require('../controllers/draggableItems.controller');

const router = express.Router();

router.get('/', DraggableItems.getAllActiveDraggableItems);

module.exports = router;
