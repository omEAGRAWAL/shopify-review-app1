const crypto = require('crypto');

/**
 * Generate a unique promo code
 * @param {string} prefix - Code prefix (e.g., 'REVIEW')
 * @param {number} length - Random part length
 * @returns {string} Generated promo code
 */
const generatePromoCode = (prefix = 'REVIEW', length = 8) => {
    const randomPart = crypto
        .randomBytes(length)
        .toString('base64')
        .replace(/[^A-Z0-9]/gi, '')
        .substring(0, length)
        .toUpperCase();

    return `${prefix}-${randomPart}`;
};

module.exports = { generatePromoCode };
