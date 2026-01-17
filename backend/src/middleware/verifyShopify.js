const crypto = require('crypto');
const shopify = require('../config/shopify');

// Verify Shopify webhook HMAC
const verifyWebhook = (req, res, next) => {
    try {
        const hmac = req.headers['x-shopify-hmac-sha256'];
        const body = req.rawBody;

        if (!hmac || !body) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const hash = crypto
            .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
            .update(body, 'utf8')
            .digest('base64');

        if (hash !== hmac) {
            return res.status(401).json({ error: 'Invalid HMAC' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Verification failed' });
    }
};

// Verify session for authenticated routes
const verifySession = async (req, res, next) => {
    try {
        const shop = req.query.shop || req.headers['x-shopify-shop-domain'];

        if (!shop) {
            return res.status(400).json({ error: 'Shop domain required' });
        }

        // For MVP: Just pass through with shop info
        req.shopDomain = shop;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Session verification failed' });
    }
};

module.exports = {
    verifyWebhook,
    verifySession,
};
