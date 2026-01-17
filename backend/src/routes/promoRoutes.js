const express = require('express');
const router = express.Router();
const {
    createPromo,
    getPromos,
    getPromo,
    updatePromo,
    deletePromo,
} = require('../controllers/promoController');
const { verifySession } = require('../middleware/verifyShopify');

// CRUD routes
router.post('/', verifySession, createPromo);
router.get('/', verifySession, getPromos);
router.get('/:id', verifySession, getPromo);
router.put('/:id', verifySession, updatePromo);
router.delete('/:id', verifySession, deletePromo);

module.exports = router;
