const Bill = require('../models/Bill');
const Stock = require('../models/Stock');

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Public
const createBill = async (req, res) => {
    const { customerName, customerPhone, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items' });
    }

    try {
        // Decrease stock quantity
        for (const item of items) {
            const stock = await Stock.findById(item.stockId);
            if (stock) {
                stock.quantity = stock.quantity - item.quantity;
                await stock.save();
            } else {
                // Note: In real app, might want to rollback or check beforehand
                // For now, proceed or throw
                throw new Error(`Stock not found for item: ${item.size} ${item.variant}`);
            }
        }

        // Generate Invoice Number
        const lastBill = await Bill.findOne().sort({ createdAt: -1 });
        let nextInvoiceNumber = 'GHW#001';

        if (lastBill && lastBill.invoiceNumber) {
            const lastNumberStr = lastBill.invoiceNumber.replace('GHW#', '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                const nextNumber = lastNumber + 1;
                nextInvoiceNumber = `GHW#${String(nextNumber).padStart(3, '0')}`;
            }
        }

        const bill = new Bill({
            invoiceNumber: nextInvoiceNumber,
            customerName,
            customerPhone,
            items,
            totalAmount
        });

        const createdBill = await bill.save();
        res.status(201).json(createdBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Public
const getBills = async (req, res) => {
    try {
        const bills = await Bill.find({}).sort({ date: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBill,
    getBills
};
