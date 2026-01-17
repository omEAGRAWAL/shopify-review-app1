const Review = require('../models/Review');
const Campaign = require('../models/Campaign');
const { generatePromoCode } = require('../utils/generatePromo');
const { isValidEmail, isValidRating, validateRequired } = require('../utils/validators');

// Submit a review (public endpoint)
const submitReview = async (req, res) => {
    try {
        const { campaignId, customerName, customerEmail, rating, reviewText, productId } = req.body;

        // Validate required fields
        const validation = validateRequired(req.body, ['campaignId', 'customerName', 'customerEmail', 'rating']);
        if (!validation.valid) {
            return res.status(400).json({
                error: `Missing required fields: ${validation.missing.join(', ')}`
            });
        }

        // Validate email
        if (!isValidEmail(customerEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate rating
        if (!isValidRating(rating)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Get campaign and promo
        const campaign = await Campaign.findById(campaignId).populate('promo');
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        if (campaign.status !== 'active') {
            return res.status(400).json({ error: 'Campaign is not active' });
        }

        // Check if customer already submitted a review for this campaign
        const existingReview = await Review.findOne({
            campaign: campaignId,
            customerEmail
        });
        if (existingReview) {
            return res.status(400).json({
                error: 'You have already submitted a review for this campaign',
                promoCode: existingReview.promoCode,
            });
        }

        // Generate promo code
        const promoCode = generatePromoCode(campaign.promo?.codePrefix || 'REVIEW');

        // Create review
        const review = await Review.create({
            campaign: campaignId,
            customerName,
            customerEmail,
            rating,
            reviewText,
            promoCode,
            productId: productId || null,
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            promoCode,
            review: {
                id: review._id,
                customerName: review.customerName,
                rating: review.rating,
            },
        });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};

// Get reviews for a campaign (admin)
const getReviews = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const reviews = await Review.find({ campaign: campaignId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews,
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Get all reviews for a shop
const getAllReviews = async (req, res) => {
    try {
        const Shop = require('../models/Shop');
        const shop = await Shop.findOne({ shopDomain: req.shopDomain });

        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Get all campaigns for this shop
        const campaigns = await Campaign.find({ shop: shop._id });
        const campaignIds = campaigns.map(c => c._id);

        // Get reviews for all campaigns
        const reviews = await Review.find({ campaign: { $in: campaignIds } })
            .populate('campaign')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews,
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Update review status (approve/reject)
const updateReviewStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({
            success: true,
            review,
        });
    } catch (error) {
        console.error('Update review status error:', error);
        res.status(500).json({ error: 'Failed to update review status' });
    }
};

module.exports = {
    submitReview,
    getReviews,
    getAllReviews,
    updateReviewStatus,
};
