const express = require('express');
const router = express.Router();
const {
    submitReview,
    getReviews,
    getAllReviews,
    updateReviewStatus,
} = require('../controllers/reviewController');
const { verifySession } = require('../middleware/verifyShopify');

// Public route for submitting reviews
router.post('/submit', submitReview);

// Protected routes
router.get('/campaign/:campaignId', verifySession, getReviews);
router.get('/', verifySession, getAllReviews);
router.patch('/:id/status', verifySession, updateReviewStatus);

module.exports = router;
