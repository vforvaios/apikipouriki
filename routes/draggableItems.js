const express = require('express');
const verifyToken = require('../utils/verifyToken');

const DraggableItems = require('../controllers/draggableItems.controller');

const router = express.Router();

router.get('/', DraggableItems.getAllDraggableItems);
router.get('/searchItems', DraggableItems.getSearchDraggableItems);
router.get('/active', DraggableItems.getAllActiveDraggableItems);
router.get('/inactive', DraggableItems.getAllInActiveDraggableItems);
router.post('/item', [verifyToken], DraggableItems.addEditDraggableItem);

module.exports = router;
