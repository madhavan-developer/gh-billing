const express = require('express');
const router = express.Router();
const { getStocks, addStock, updateStock, deleteStock } = require('../controllers/stockController');

router.route('/').get(getStocks).post(addStock);
router.route('/:id').put(updateStock).delete(deleteStock);

module.exports = router;
