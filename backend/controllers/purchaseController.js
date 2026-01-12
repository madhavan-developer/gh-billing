const Purchase = require('../models/Purchase');

const getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find({}).sort({ date: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addPurchase = async (req, res) => {
    const { vendorName, productName, quantity, cost, date, notes } = req.body;

    if (!vendorName || !productName || !quantity || !cost) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        const purchase = new Purchase({
            vendorName,
            productName,
            quantity,
            cost,
            date: date || Date.now(),
            notes
        });

        const createdPurchase = await purchase.save();
        res.status(201).json(createdPurchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePurchase = async (req, res) => {
    const { id } = req.params;
    const { vendorName, productName, quantity, cost, date, notes } = req.body;

    try {
        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        purchase.vendorName = vendorName || purchase.vendorName;
        purchase.productName = productName || purchase.productName;
        purchase.quantity = quantity || purchase.quantity;
        purchase.cost = cost || purchase.cost;
        purchase.date = date || purchase.date;
        purchase.notes = notes || purchase.notes;

        const updatedPurchase = await purchase.save();
        res.json(updatedPurchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePurchase = async (req, res) => {
    const { id } = req.params;
    try {
        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        await purchase.deleteOne();
        res.json({ message: 'Purchase removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPurchases, addPurchase, updatePurchase, deletePurchase };
