const express = require('express');
const router = express.Router();
const {
    createCampaign,
    getCampaigns,
    getCampaign,
    getCampaignByPublicUrl,
    updateCampaign,
    deleteCampaign,
} = require('../controllers/campaignController');
const { verifySession } = require('../middleware/verifyShopify');

// Public route for review form
router.get('/public/:publicUrl', getCampaignByPublicUrl);

// CRUD routes (protected)
router.post('/', verifySession, createCampaign);
router.get('/', verifySession, getCampaigns);
router.get('/:id', verifySession, getCampaign);
router.put('/:id', verifySession, updateCampaign);
router.delete('/:id', verifySession, deleteCampaign);

module.exports = router;
