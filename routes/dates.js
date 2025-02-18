const express = require('express');
const Dates = require('../controllers/dates.controller');

const router = express.Router();

router.get('/', Dates.getLastDates);

module.exports = router;
