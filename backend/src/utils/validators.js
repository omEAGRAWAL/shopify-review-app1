/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate rating (1-5)
 * @param {number} rating
 * @returns {boolean}
 */
const isValidRating = (rating) => {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

/**
 * Validate required fields in an object
 * @param {object} obj - Object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{valid: boolean, missing: string[]}}
 */
const validateRequired = (obj, requiredFields) => {
    const missing = requiredFields.filter(
        (field) => !obj[field] || obj[field].toString().trim() === ''
    );
    return {
        valid: missing.length === 0,
        missing,
    };
};

module.exports = {
    isValidEmail,
    isValidRating,
    validateRequired,
};
