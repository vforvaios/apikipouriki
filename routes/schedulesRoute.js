const express = require('express');
const verifyToken = require('../utils/verifyToken');
const Schedules = require('../controllers/schedules.controller');

const router = express.Router();

router.get('/current', Schedules.getCurrentSchedule);
router.post('/setdefault', [verifyToken], Schedules.setDefaultSchedule);
router.get('/', Schedules.getAllSchedules);
router.post(
  '/current/addItem',
  [verifyToken],
  Schedules.addDraggableItemInCurrentSchedule,
);
router.post(
  '/current/removeItem',
  [verifyToken],
  Schedules.removeDraggableItemFromCurrentSchedule,
);
router.post(
  '/current/doneNotDoneItem',
  [verifyToken],
  Schedules.convertDraggableItemFromCurrentSchedule,
);

module.exports = router;
