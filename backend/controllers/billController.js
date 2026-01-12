const Bill = require('../models/Bill');
const Stock = require('../models/Stock');

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Public
const createBill = async (req, res) => {
    const { customerName, customerPhone, items, totalAmount, date } = req.body;

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
            totalAmount,
            date: date || Date.now()
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
        const bills = await Bill.find({});

        // Sort by invoice number descending (numeric)
        bills.sort((a, b) => {
            const numA = parseInt(a.invoiceNumber.replace('GHW#', '') || 0);
            const numB = parseInt(b.invoiceNumber.replace('GHW#', '') || 0);
            return numB - numA;
        });

        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Public
const deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);

        if (!bill) {
            res.status(404);
            throw new Error('Bill not found');
        }

        // Add back stock quantity
        for (const item of bill.items) {
            const stock = await Stock.findById(item.stockId);
            if (stock) {
                stock.quantity = stock.quantity + item.quantity;
                await stock.save();
            }
        }

        await bill.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Public
const updateBill = async (req, res) => {
    const { customerName, customerPhone, items, totalAmount, date } = req.body;

    try {
        const bill = await Bill.findById(req.params.id);

        if (!bill) {
            res.status(404);
            throw new Error('Bill not found');
        }

        // 1. Revert original stock
        for (const item of bill.items) {
            const stock = await Stock.findById(item.stockId);
            if (stock) {
                stock.quantity = stock.quantity + item.quantity;
                await stock.save();
            }
        }

        // 2. Validate and Deduct new stock
        for (const item of items) {
            const stock = await Stock.findById(item.stockId);
            if (stock) {
                if (stock.quantity < item.quantity) {
                    // Rollback is tricky here without transactions or complex logic.
                    // For this simple app, we'll throw, but note that the Revert above already happened.
                    // Ideally we'd use a transaction if MongoDB Replica Set is enabled.
                    throw new Error(`Not enough stock for ${item.size} ${item.variant}. Available: ${stock.quantity}`);
                }
                stock.quantity = stock.quantity - item.quantity;
                await stock.save();
            } else {
                throw new Error(`Stock not found for item: ${item.size} ${item.variant}`);
            }
        }

        // 3. Update Bill
        bill.customerName = customerName;
        bill.customerPhone = customerPhone;
        bill.items = items;
        bill.totalAmount = totalAmount;
        if (date) bill.date = date;

        const updatedBill = await bill.save();
        res.status(200).json(updatedBill);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createBill,
    getBills,
    deleteBill,
    updateBill
};
