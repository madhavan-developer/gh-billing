const mongoose = require('mongoose');

const purchaseSchema = mongoose.Schema({
    vendorName: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Purchase', purchaseSchema);
