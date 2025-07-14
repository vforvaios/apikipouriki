const express = require('express');
const Cars = require('../controllers/cars.controller');

const router = express.Router();

router.get('/', Cars.getAllActiveCars);
router.post('/', Cars.updateAllCars);

module.exports = router;
