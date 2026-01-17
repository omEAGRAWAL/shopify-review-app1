# Shopify Review-Incentive App - Backend

A Node.js/Express backend for the Shopify Review-Incentive App.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

- `SHOPIFY_API_KEY` - Your Shopify app API key
- `SHOPIFY_API_SECRET` - Your Shopify app secret
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens

## API Endpoints

### Auth
- `GET /auth?shop=<domain>` - Begin OAuth
- `GET /auth/callback` - OAuth callback
- `GET /auth/session` - Get current session

### Products
- `GET /api/products` - Fetch products
- `GET /api/products/collections` - Fetch collections

### Promos
- `POST /api/promos` - Create promo
- `GET /api/promos` - List promos
- `GET /api/promos/:id` - Get promo
- `PUT /api/promos/:id` - Update promo
- `DELETE /api/promos/:id` - Delete promo

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign
- `GET /api/campaigns/public/:url` - Public campaign info
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Reviews
- `POST /api/reviews/submit` - Submit review (public)
- `GET /api/reviews` - List all reviews
- `GET /api/reviews/campaign/:id` - Reviews by campaign
- `PATCH /api/reviews/:id/status` - Update review status
