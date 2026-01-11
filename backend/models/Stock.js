const mongoose = require('mongoose');

const stockSchema = mongoose.Schema({
    size: { type: String, required: true },
    variant: { type: String, required: true }, // e.g., 'Black', 'Wood', 'Gold'
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Stock', stockSchema);
