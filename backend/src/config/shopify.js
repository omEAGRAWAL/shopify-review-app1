const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES.split(','),
    hostName: process.env.SHOPIFY_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:5000',
    apiVersion: process.env.SHOPIFY_API_VERSION || LATEST_API_VERSION,
    isEmbeddedApp: true,
});

module.exports = shopify;
