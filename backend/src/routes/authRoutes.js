const express = require('express');
const router = express.Router();
const { beginAuth, authCallback, getSession } = require('../controllers/authController');
const { verifySession } = require('../middleware/verifyShopify');

// Begin OAuth flow
router.get('/', beginAuth);

// OAuth callback
router.get('/callback', authCallback);

// Get current session
router.get('/session', verifySession, getSession);

module.exports = router;
