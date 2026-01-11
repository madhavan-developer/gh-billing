const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    items: [{
        stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
        size: { type: String, required: true },
        variant: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Bill', billSchema);
