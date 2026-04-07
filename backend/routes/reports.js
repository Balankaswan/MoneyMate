const express = require('express');
const router = express.Router();
const { getMonthlyReport, getYearlyReport } = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);

module.exports = router;
