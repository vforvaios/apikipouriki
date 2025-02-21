const express = require('express');
const Schedules = require('../controllers/schedules.controller');

const router = express.Router();

router.get('/current', Schedules.getCurrentSchedule);

module.exports = router;
