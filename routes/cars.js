const express = require('express');
const Cars = require('../controllers/cars.controller');

const router = express.Router();

router.get('/', Cars.getAllActiveCars);

module.exports = router;
