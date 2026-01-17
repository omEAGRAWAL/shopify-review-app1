const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['discount', 'warranty'],
        required: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
    },
    discountValue: {
        type: Number,
    },
    codePrefix: {
        type: String,
        default: 'REVIEW',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Promo', promoSchema);
