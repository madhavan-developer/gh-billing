const express = require('express');
const router = express.Router();
const { createBill, getBills, deleteBill, updateBill } = require('../controllers/billController');


router.route('/').post(createBill).get(getBills);
router.route('/:id').delete(deleteBill).put(updateBill);


module.exports = router;
