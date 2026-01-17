require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const promoRoutes = require('./routes/promoRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.SHOPIFY_APP_URL, process.env.PUBLIC_FORM_URL]
        : '*',
    credentials: true,
}));

// Raw body for webhook verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    },
}));

app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - handles OAuth redirect
app.get('/', (req, res) => {
    const { shop, host } = req.query;

    if (shop) {
        // Redirect to frontend app
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/?shop=${shop}&host=${host || ''}`);
    }

    res.json({
        message: 'Shopify Review Incentive App API',
        status: 'running',
        endpoints: ['/auth', '/api/products', '/api/promos', '/api/campaigns', '/api/reviews']
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
}

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
