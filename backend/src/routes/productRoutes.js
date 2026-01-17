const express = require('express');
const router = express.Router();
const { getProducts, getCollections } = require('../controllers/productController');
const { verifySession } = require('../middleware/verifyShopify');

// Get products
router.get('/', verifySession, getProducts);

// Get collections
router.get('/collections', verifySession, getCollections);

module.exports = router;
