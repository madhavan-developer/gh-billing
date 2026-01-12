const express = require('express');
const router = express.Router();
const { getPurchases, addPurchase, updatePurchase, deletePurchase } = require('../controllers/purchaseController');

router.route('/').get(getPurchases).post(addPurchase);
router.route('/:id').put(updatePurchase).delete(deletePurchase);

module.exports = router;
