const express = require('express');
const router = express.Router();
const { getEMIs, createEMI, updateEMI, deleteEMI, markEMIPaid, markEMIUnpaid } = require('../controllers/emiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getEMIs).post(createEMI);
router.route('/:id').put(updateEMI).delete(deleteEMI);
router.post('/:id/pay', markEMIPaid);
router.post('/:id/unpay', markEMIUnpaid);

module.exports = router;
