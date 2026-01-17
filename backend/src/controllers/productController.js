const Shop = require('../models/Shop');
const axios = require('axios');

// Fetch products from Shopify
const getProducts = async (req, res) => {
    try {
        console.log(`Fetching products for shop: ${req.shopDomain}`);
        const shop = await Shop.findOne({ shopDomain: req.shopDomain });

        if (!shop) {
            console.log(`Shop not found in DB: ${req.shopDomain}`);
            return res.status(404).json({ error: 'Shop not found' });
        }

        console.log(`Found shop, access token exists: ${!!shop.accessToken}`);
        const apiUrl = `https://${shop.shopDomain}/admin/api/${process.env.SHOPIFY_API_VERSION}/products.json`;
        console.log(`API URL: ${apiUrl}`);

        const response = await axios({
            method: 'GET',
            url: apiUrl,
            headers: {
                'X-Shopify-Access-Token': shop.accessToken,
                'Content-Type': 'application/json',
            },
            params: {
                limit: req.query.limit || 50,
            },
        });

        console.log(`Products fetched: ${response.data.products?.length || 0}`);
        res.json({
            success: true,
            products: response.data.products,
        });
    } catch (error) {
        console.error('Get products error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to fetch products',
            details: error.response?.data || error.message
        });
    }
};

// Fetch collections from Shopify
const getCollections = async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopDomain: req.shopDomain });

        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const response = await axios({
            method: 'GET',
            url: `https://${shop.shopDomain}/admin/api/${process.env.SHOPIFY_API_VERSION}/custom_collections.json`,
            headers: {
                'X-Shopify-Access-Token': shop.accessToken,
                'Content-Type': 'application/json',
            },
        });

        res.json({
            success: true,
            collections: response.data.custom_collections,
        });
    } catch (error) {
        console.error('Get collections error:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
};

module.exports = {
    getProducts,
    getCollections,
};
