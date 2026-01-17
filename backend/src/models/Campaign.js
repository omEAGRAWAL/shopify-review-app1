const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    productIds: [{
        type: String, // Shopify product GIDs
    }],
    promo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promo',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'ended'],
        default: 'active',
    },
    publicUrl: {
        type: String,
        unique: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Campaign', campaignSchema);
