const Shop = require('../models/Shop');
const shopify = require('../config/shopify');

// Begin OAuth flow
const beginAuth = async (req, res) => {
    try {
        const { shop } = req.query;

        if (!shop) {
            return res.status(400).json({
                error: 'Shop parameter required',
                example: 'Use: /auth?shop=your-store.myshopify.com'
            });
        }

        // Validate shop domain format
        if (!shop.endsWith('.myshopify.com')) {
            return res.status(400).json({
                error: 'Invalid shop domain',
                message: 'Shop must end with .myshopify.com',
                received: shop
            });
        }

        console.log(`Starting OAuth for shop: ${shop}`);

        // Shopify API v12+ requires rawRequest and rawResponse
        await shopify.auth.begin({
            shop,
            callbackPath: '/auth/callback',
            isOnline: false,
            rawRequest: req,
            rawResponse: res,
        });

        // Note: auth.begin handles the redirect automatically
    } catch (error) {
        console.error('Auth begin error:', error);
        res.status(500).json({
            error: 'Failed to begin authentication',
            message: error.message,
            hint: 'Make sure your Shopify app credentials are correct and the shop exists'
        });
    }
};

// Handle OAuth callback
const authCallback = async (req, res) => {
    try {
        const callback = await shopify.auth.callback({
            rawRequest: req,
            rawResponse: res,
        });

        const { session } = callback;

        // Store or update shop in database
        await Shop.findOneAndUpdate(
            { shopDomain: session.shop },
            {
                shopDomain: session.shop,
                accessToken: session.accessToken,
                scope: session.scope,
                isActive: true,
            },
            { upsert: true, new: true }
        );

        // Redirect to app
        res.redirect(`/?shop=${session.shop}&host=${req.query.host}`);
    } catch (error) {
        console.error('Auth callback error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// Get current session/shop info
const getSession = async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopDomain: req.shopDomain });

        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        res.json({
            success: true,
            shop: {
                domain: shop.shopDomain,
                isActive: shop.isActive,
            },
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ error: 'Failed to get session' });
    }
};

module.exports = {
    beginAuth,
    authCallback,
    getSession,
};
