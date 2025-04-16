const express = require('express');
const Dates = require('../controllers/dates.controller');

const router = express.Router();

router.get('/', Dates.getLastDates);
router.get('/:id', Dates.getDatesByScheduleId);
router.get('/schedule', Dates.scheduleAdditionOfNewDates);

module.exports = router;
