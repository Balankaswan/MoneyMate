const express = require('express');
const router = express.Router();
const {
    getSubscriptions,
    detectSubscriptions,
    analyzeSubscriptions,
    trimSubscriptions,
    updateSubscription,
    seedDemoData
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSubscriptions);
router.post('/detect', detectSubscriptions);
router.post('/analyze', analyzeSubscriptions);
router.post('/trim', trimSubscriptions);
router.post('/seed', seedDemoData);
router.put('/:id', updateSubscription);

module.exports = router;
