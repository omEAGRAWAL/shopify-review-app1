const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    reviewText: {
        type: String,
    },
    promoCode: {
        type: String,
    },
    productId: {
        type: String, // Shopify product ID
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved', // Auto-approve for MVP
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema);
