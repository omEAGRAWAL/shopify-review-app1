const Campaign = require('../models/Campaign');
const Shop = require('../models/Shop');
const crypto = require('crypto');
const { validateRequired } = require('../utils/validators');

// Create a new campaign
const createCampaign = async (req, res) => {
    try {
        const { name, productIds, promoId, startDate, endDate } = req.body;

        const validation = validateRequired(req.body, ['name', 'promoId']);
        if (!validation.valid) {
            return res.status(400).json({
                error: `Missing required fields: ${validation.missing.join(', ')}`
            });
        }

        const shop = await Shop.findOne({ shopDomain: req.shopDomain });
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // Generate unique public URL slug
        const publicUrl = crypto.randomBytes(8).toString('hex');

        const campaign = await Campaign.create({
            shop: shop._id,
            name,
            productIds: productIds || [],
            promo: promoId,
            publicUrl,
            startDate,
            endDate,
        });

        res.status(201).json({
            success: true,
            campaign,
        });
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

// Get all campaigns for a shop
const getCampaigns = async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopDomain: req.shopDomain });
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const campaigns = await Campaign.find({ shop: shop._id })
            .populate('promo')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            campaigns,
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

// Get a single campaign
const getCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id).populate('promo');

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json({
            success: true,
            campaign,
        });
    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
};

// Get campaign by public URL (for public review form)
const getCampaignByPublicUrl = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            publicUrl: req.params.publicUrl,
            status: 'active',
        }).populate('promo');

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found or inactive' });
        }

        // Get shop info for product fetching
        const shop = await Shop.findById(campaign.shop);

        // Fetch product details from Shopify if productIds exist
        let products = [];
        if (campaign.productIds && campaign.productIds.length > 0 && shop) {
            try {
                const axios = require('axios');
                const productPromises = campaign.productIds.map(async (productId) => {
                    try {
                        const response = await axios({
                            method: 'GET',
                            url: `https://${shop.shopDomain}/admin/api/${process.env.SHOPIFY_API_VERSION}/products/${productId}.json`,
                            headers: {
                                'X-Shopify-Access-Token': shop.accessToken,
                                'Content-Type': 'application/json',
                            },
                        });
                        return {
                            id: response.data.product.id,
                            title: response.data.product.title,
                            image: response.data.product.images?.[0]?.src || null,
                        };
                    } catch (err) {
                        console.error(`Failed to fetch product ${productId}:`, err.message);
                        return null;
                    }
                });
                products = (await Promise.all(productPromises)).filter(p => p !== null);
            } catch (err) {
                console.error('Error fetching products:', err.message);
            }
        }

        res.json({
            success: true,
            campaign: {
                id: campaign._id,
                name: campaign.name,
                productIds: campaign.productIds,
                products: products,
                shopDomain: shop?.shopDomain,
            },
        });
    } catch (error) {
        console.error('Get campaign by URL error:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
};

// Update a campaign
const updateCampaign = async (req, res) => {
    try {
        const { name, productIds, promoId, status, startDate, endDate } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (productIds) updateData.productIds = productIds;
        if (promoId) updateData.promo = promoId;
        if (status) updateData.status = status;
        if (startDate) updateData.startDate = startDate;
        if (endDate) updateData.endDate = endDate;

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('promo');

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json({
            success: true,
            campaign,
        });
    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
};

// Delete a campaign
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json({
            success: true,
            message: 'Campaign deleted successfully',
        });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaign,
    getCampaignByPublicUrl,
    updateCampaign,
    deleteCampaign,
};
