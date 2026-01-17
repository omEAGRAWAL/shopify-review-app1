const Promo = require('../models/Promo');
const Shop = require('../models/Shop');
const { validateRequired } = require('../utils/validators');

// Create a new promo
const createPromo = async (req, res) => {
    try {
        const { name, type, discountType, discountValue, codePrefix } = req.body;

        const validation = validateRequired(req.body, ['name', 'type']);
        if (!validation.valid) {
            return res.status(400).json({
                error: `Missing required fields: ${validation.missing.join(', ')}`
            });
        }

        const shop = await Shop.findOne({ shopDomain: req.shopDomain });
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const promo = await Promo.create({
            shop: shop._id,
            name,
            type,
            discountType,
            discountValue,
            codePrefix: codePrefix || 'REVIEW',
        });

        res.status(201).json({
            success: true,
            promo,
        });
    } catch (error) {
        console.error('Create promo error:', error);
        res.status(500).json({ error: 'Failed to create promo' });
    }
};

// Get all promos for a shop
const getPromos = async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopDomain: req.shopDomain });
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const promos = await Promo.find({ shop: shop._id, isActive: true });

        res.json({
            success: true,
            promos,
        });
    } catch (error) {
        console.error('Get promos error:', error);
        res.status(500).json({ error: 'Failed to fetch promos' });
    }
};

// Get a single promo
const getPromo = async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);

        if (!promo) {
            return res.status(404).json({ error: 'Promo not found' });
        }

        res.json({
            success: true,
            promo,
        });
    } catch (error) {
        console.error('Get promo error:', error);
        res.status(500).json({ error: 'Failed to fetch promo' });
    }
};

// Update a promo
const updatePromo = async (req, res) => {
    try {
        const { name, type, discountType, discountValue, codePrefix, isActive } = req.body;

        const promo = await Promo.findByIdAndUpdate(
            req.params.id,
            { name, type, discountType, discountValue, codePrefix, isActive },
            { new: true }
        );

        if (!promo) {
            return res.status(404).json({ error: 'Promo not found' });
        }

        res.json({
            success: true,
            promo,
        });
    } catch (error) {
        console.error('Update promo error:', error);
        res.status(500).json({ error: 'Failed to update promo' });
    }
};

// Delete a promo (soft delete)
const deletePromo = async (req, res) => {
    try {
        const promo = await Promo.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!promo) {
            return res.status(404).json({ error: 'Promo not found' });
        }

        res.json({
            success: true,
            message: 'Promo deleted successfully',
        });
    } catch (error) {
        console.error('Delete promo error:', error);
        res.status(500).json({ error: 'Failed to delete promo' });
    }
};

module.exports = {
    createPromo,
    getPromos,
    getPromo,
    updatePromo,
    deletePromo,
};
