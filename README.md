# Real-Time Auction Marketplace Backend

A comprehensive Node.js/Express.js backend API for a real-time auction marketplace application.

## 🚀 Features

- **User Authentication**: Registration, login, and JWT-based authentication
- **Auction Management**: Create, list, update, and delete auctions with categories and tags
- **Real-Time Bidding**: Manual and auto-bid functionality with live updates via Socket.io
- **Payment Integration**: Stripe integration for secure payments
- **Notifications**: Email and in-app notifications for auction events
- **Reviews & Trust**: Review system for sellers with rating calculations
- **Watchlist**: Save auctions to watchlist
- **Search & Filtering**: Advanced search and filtering capabilities
- **Homepage Collections**: Featured, favorites, best sellers, sale, and new collections

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Nodemailer** - Email notifications
- **Bcrypt** - Password hashing

## 📦 Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd auction-marketplace-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

5. (Optional) Seed demo data
```bash
npm run seed
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Auctions
- `GET /api/auctions` - Get all auctions (with filtering and sorting)
- `GET /api/auctions/homepage` - Get homepage collections
- `GET /api/auctions/:id` - Get single auction
- `POST /api/auctions` - Create auction (Seller)
- `PUT /api/auctions/:id` - Update auction (Seller)
- `DELETE /api/auctions/:id` - Delete auction (Seller)
- `GET /api/auctions/seller/my-auctions` - Get seller's auctions

### Bids
- `POST /api/bids` - Place bid
- `GET /api/bids/active` - Get active bids
- `GET /api/bids/history` - Get bid history
- `DELETE /api/bids/auto-bid/:auctionId` - Cancel auto-bid

### Watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:auctionId` - Remove from watchlist
- `GET /api/watchlist` - Get watchlist
- `GET /api/watchlist/check/:auctionId` - Check if in watchlist

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/won-auctions` - Get won auctions
- `GET /api/users/purchase-history` - Get purchase history
- `GET /api/users/earnings` - Get seller earnings (Seller)

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/seller/:sellerId` - Get seller reviews
- `GET /api/reviews/my-reviews` - Get user's reviews

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/history` - Get payment history

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
- `DELETE /api/notifications/:id` - Delete notification

### Contact
- `POST /api/contact` - Submit contact form

## 🔌 Real-Time Features

The application uses Socket.io for real-time updates:

- **Join Auction Room**: `socket.on('join-auction', auctionId)`
- **Leave Auction Room**: `socket.on('leave-auction', auctionId)`
- **New Bid Event**: `socket.on('new-bid', data)`

## 📊 Database Models

- **User**: User accounts with roles (buyer, seller, hybrid)
- **Auction**: Auction listings with all details
- **Bid**: Bid records (manual and auto-bid)
- **Watchlist**: User watchlist items
- **Review**: Seller reviews
- **Notification**: User notifications
- **Payment**: Payment records
- **Contact**: Contact form submissions

## 📁 Project Structure

```
.
├── config/          # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── scripts/         # Utility scripts (seed data, etc.)
├── utils/           # Utility functions
├── server.js        # Main server file
└── package.json     # Dependencies
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Helmet.js for security headers
- Input validation with express-validator
- CORS configuration
- Rate limiting ready

## 🧪 Development

The server runs on port 5001 by default (to avoid conflicts with macOS AirPlay on port 5000). Make sure MongoDB is running before starting the server.

## 📝 License

ISC
