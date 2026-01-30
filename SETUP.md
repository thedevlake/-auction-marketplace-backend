# Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Stripe account (for payments)
- Email account (for notifications)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/auction-marketplace
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system.

4. **Start the Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## Stripe Webhook Setup

For Stripe webhooks to work in development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
4. Copy the webhook signing secret and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASS`

## Testing the API

1. **Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register a User**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "confirmPassword": "password123"
     }'
   ```

3. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

## Project Structure

```
ecom/
├── config/          # Configuration files
├── controllers/     # Route controllers (business logic)
├── middleware/      # Custom middleware (auth, etc.)
├── models/          # Mongoose models (database schemas)
├── routes/          # Express routes (API endpoints)
├── utils/           # Utility functions (helpers, schedulers)
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # Documentation
```

## Key Features Implemented

✅ User authentication (register, login, JWT)
✅ Auction CRUD operations
✅ Real-time bidding with Socket.io
✅ Auto-bid functionality
✅ Payment integration (Stripe)
✅ Email notifications
✅ Reviews and ratings
✅ Watchlist
✅ Search and filtering
✅ Homepage collections
✅ Scheduled tasks (auction status, payment reminders)

## Notes

- The server automatically checks auction statuses every minute
- Payment reminders are sent hourly for auctions with approaching deadlines
- Auctions ending soon notifications are checked every 5 minutes
- All timestamps are in UTC
