const express = require('express');
const verifyToken = require('../utils/verifyToken');

const DraggableItems = require('../controllers/draggableItems.controller');

const router = express.Router();

router.get('/', DraggableItems.getAllActiveDraggableItems);
router.post('/item', [verifyToken], DraggableItems.addEditDraggableItem);

module.exports = router;
