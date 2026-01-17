# Shopify Review-Incentive App

A Shopify app that allows merchants to create review campaigns where customers can submit reviews in exchange for promo codes.

## Project Structure

```
shopify-review-app/
├── backend/         # Node.js/Express API server
├── frontend/        # React merchant dashboard (Polaris)
└── public-form/     # React public review form
```

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Shopify Partner account
- ngrok (for local development)

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env with your credentials
npm run dev
```

### 2. Frontend Setup (Merchant Dashboard)
```bash
cd frontend
npm install
npm run dev
```

### 3. Public Form Setup
```bash
cd public-form
npm install
npm run dev
```

### 4. ngrok Tunnel
```bash
ngrok http 5000
```
Update your Shopify app URLs with the ngrok URL.

## Environment Variables

### Backend (.env)
- `SHOPIFY_API_KEY` - Your Shopify app API key
- `SHOPIFY_API_SECRET` - Your Shopify app secret  
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SHOPIFY_API_KEY` - Shopify API key

## Features

- **Promo Management** - Create discount/warranty promo templates
- **Campaign Creation** - Link products to promos
- **Public Review Forms** - Customers submit reviews
- **Automatic Promo Codes** - Generated on review submission
- **Review Moderation** - Approve/reject reviews

## API Endpoints

See `backend/README.md` for full API documentation.
