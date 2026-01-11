const Stock = require('../models/Stock');

// @desc    Get all stock
// @route   GET /api/stocks
// @access  Public
const getStocks = async (req, res) => {
    try {
        const stocks = await Stock.find({});
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new stock
// @route   POST /api/stocks
// @access  Public
const addStock = async (req, res) => {
    const { size, variant, price, quantity } = req.body;

    if (!size || !variant || !price) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const stock = new Stock({
            size,
            variant,
            price,
            quantity
        });

        const createdStock = await stock.save();
        res.status(201).json(createdStock);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update stock
// @route   PUT /api/stocks/:id
// @access  Public
const updateStock = async (req, res) => {
    const { size, variant, price, quantity } = req.body;

    try {
        const stock = await Stock.findById(req.params.id);

        if (stock) {
            stock.size = size || stock.size;
            stock.variant = variant || stock.variant;
            stock.price = price || stock.price;
            stock.quantity = quantity !== undefined ? quantity : stock.quantity;

            const updatedStock = await stock.save();
            res.json(updatedStock);
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete stock
// @route   DELETE /api/stocks/:id
// @access  Public
const deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);

        if (stock) {
            await stock.deleteOne();
            res.json({ message: 'Stock removed' });
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStocks,
    addStock,
    updateStock,
    deleteStock
};
