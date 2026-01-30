# Endpoint Usage Guide

## Authentication

### Register User

**Endpoint**: `POST /api/auth/register`

**Headers**: None (public)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "message": "Registration successful. Please login.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

**Error** (400):
```json
{
  "message": "Email already registered"
}
```

### Login

**Endpoint**: `POST /api/auth/login`

**Headers**: None (public)

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "rating": 0
  }
}
```

**Error** (401):
```json
{
  "message": "Invalid email or password"
}
```

### Get Current User

**Endpoint**: `GET /api/auth/me`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "rating": 4.5,
    "totalReviews": 10,
    "verified": false
  }
}
```

---

## Auctions

### Get Homepage Collections

**Endpoint**: `GET /api/auctions/homepage`

**Headers**: None (public)

**Response** (200):
```json
{
  "featured": [ ... ],
  "favorites": [ ... ],
  "bestSellers": [ ... ],
  "sale": [ ... ],
  "newIn": [ ... ]
}
```

### Get All Auctions

**Endpoint**: `GET /api/auctions`

**Headers**: Optional `Authorization: Bearer <token>` (for personalized results)

**Query Parameters**:
- `category`: Filter by category (Basic, Daily, Tech, Services, Collectibles, Digital, Fashion)
- `status`: Filter by status (live, upcoming, ended)
- `sortBy`: Sort order (newest, endingSoon, priceAsc, priceDesc, mostBids, relevance)
- `search`: Search term
- `limit`: Number of results (default: 20)
- `page`: Page number (default: 1)

**Example**: `GET /api/auctions?category=Tech&status=live&sortBy=endingSoon&limit=10`

**Response** (200):
```json
{
  "auctions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "itemName": "Vintage MacBook Pro",
      "description": "Excellent condition...",
      "images": ["https://example.com/image1.jpg"],
      "category": "Tech",
      "tags": ["New", "Trending"],
      "startingPrice": 1200,
      "currentBid": 1250,
      "bidIncrement": 50,
      "numberOfBids": 5,
      "status": "live",
      "endTime": "2026-02-07T12:00:00.000Z",
      "seller": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Demo Seller"
      },
      "highestBidder": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe"
      },
      "createdAt": "2026-01-30T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 5
}
```

### Get Single Auction

**Endpoint**: `GET /api/auctions/:id`

**Headers**: Optional `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "auction": {
    "_id": "507f1f77bcf86cd799439011",
    "itemName": "Vintage MacBook Pro",
    "description": "Full description...",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "category": "Tech",
    "tags": ["New", "Trending"],
    "startingPrice": 1200,
    "currentBid": 1250,
    "bidIncrement": 50,
    "reservePrice": 1500,
    "numberOfBids": 5,
    "status": "live",
    "endTime": "2026-02-07T12:00:00.000Z",
    "condition": "Excellent",
    "material": "Aluminum",
    "sizeQuantity": "16 inch",
    "deliveryReturns": "Free shipping, 30-day returns",
    "commonQuestions": [
      {
        "question": "What's the condition?",
        "answer": "Excellent, like new"
      }
    ],
    "seller": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Demo Seller",
      "rating": 4.8
    },
    "highestBidder": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe"
    },
    "createdAt": "2026-01-30T10:00:00.000Z"
  },
  "bidHistory": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "bidAmount": 1250,
      "bidder": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe"
      },
      "createdAt": "2026-01-30T11:00:00.000Z"
    }
  ]
}
```

### Create Auction

**Endpoint**: `POST /api/auctions`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Access**: Seller or Hybrid role required

**Request Body**:
```json
{
  "itemName": "Vintage MacBook Pro",
  "description": "Excellent condition MacBook Pro...",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "category": "Tech",
  "tags": ["New", "Trending"],
  "startingPrice": 1200,
  "bidIncrement": 50,
  "reservePrice": 1500,
  "endTime": "2026-02-07T12:00:00.000Z",
  "condition": "Excellent",
  "material": "Aluminum",
  "sizeQuantity": "16 inch",
  "deliveryReturns": "Free shipping, 30-day returns",
  "commonQuestions": [
    {
      "question": "What's the condition?",
      "answer": "Excellent, like new"
    }
  ]
}
```

**Response** (201):
```json
{
  "message": "Auction created successfully",
  "auction": { ... }
}
```

### Update Auction

**Endpoint**: `PUT /api/auctions/:id`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Access**: Seller (owner only)

**Request Body**: Same as create (all fields optional)

**Response** (200):
```json
{
  "message": "Auction updated successfully",
  "auction": { ... }
}
```

### Delete Auction

**Endpoint**: `DELETE /api/auctions/:id`

**Headers**: 
```
Authorization: Bearer <token>
```

**Access**: Seller (owner only)

**Response** (200):
```json
{
  "message": "Auction deleted successfully"
}
```

### Get Seller's Auctions

**Endpoint**: `GET /api/auctions/seller/my-auctions`

**Headers**: 
```
Authorization: Bearer <token>
```

**Access**: Seller or Hybrid role required

**Response** (200):
```json
{
  "auctions": [ ... ]
}
```

---

## Bids

### Place Bid

**Endpoint**: `POST /api/bids`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "auctionId": "507f1f77bcf86cd799439011",
  "bidAmount": 1300,
  "isAutoBid": false
}
```

**Auto-Bid Request**:
```json
{
  "auctionId": "507f1f77bcf86cd799439011",
  "bidAmount": 1300,
  "isAutoBid": true,
  "maxBid": 2000
}
```

**Response** (201):
```json
{
  "message": "Bid placed successfully",
  "bid": {
    "_id": "507f1f77bcf86cd799439015",
    "auction": "507f1f77bcf86cd799439011",
    "bidder": "507f1f77bcf86cd799439013",
    "bidAmount": 1300,
    "isAutoBid": false,
    "isWinning": true,
    "createdAt": "2026-01-30T12:00:00.000Z"
  }
}
```

**Error** (400):
```json
{
  "message": "Bid must be at least $1300.00"
}
```

### Get Active Bids

**Endpoint**: `GET /api/bids/active`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "bids": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "auction": {
        "_id": "507f1f77bcf86cd799439011",
        "itemName": "Vintage MacBook Pro",
        "currentBid": 1300,
        "endTime": "2026-02-07T12:00:00.000Z",
        "status": "live"
      },
      "bidAmount": 1300,
      "isAutoBid": false,
      "isWinning": true,
      "createdAt": "2026-01-30T12:00:00.000Z"
    }
  ]
}
```

### Get Bid History

**Endpoint**: `GET /api/bids/history`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "bids": [ ... ]
}
```

### Cancel Auto-Bid

**Endpoint**: `DELETE /api/bids/auto-bid/:auctionId`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Auto-bid cancelled successfully"
}
```

---

## Watchlist

### Add to Watchlist

**Endpoint**: `POST /api/watchlist`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "auctionId": "507f1f77bcf86cd799439011"
}
```

**Response** (201):
```json
{
  "message": "Added to watchlist",
  "watchlist": {
    "_id": "507f1f77bcf86cd799439016",
    "user": "507f1f77bcf86cd799439013",
    "auction": "507f1f77bcf86cd799439011",
    "createdAt": "2026-01-30T12:00:00.000Z"
  }
}
```

### Remove from Watchlist

**Endpoint**: `DELETE /api/watchlist/:auctionId`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Removed from watchlist"
}
```

### Get Watchlist

**Endpoint**: `GET /api/watchlist`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "watchlist": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "auction": {
        "_id": "507f1f77bcf86cd799439011",
        "itemName": "Vintage MacBook Pro",
        "currentBid": 1300,
        "endTime": "2026-02-07T12:00:00.000Z",
        "status": "live"
      },
      "createdAt": "2026-01-30T12:00:00.000Z"
    }
  ]
}
```

### Check Watchlist Status

**Endpoint**: `GET /api/watchlist/check/:auctionId`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "inWatchlist": true
}
```

---

## Payments

### Create Payment Intent

**Endpoint**: `POST /api/payments/create-intent`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "auctionId": "507f1f77bcf86cd799439011",
  "paymentMethod": "card"
}
```

**Response** (200):
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Confirm Payment

**Endpoint**: `POST /api/payments/confirm`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "paymentId": "pi_xxx"
}
```

**Response** (200):
```json
{
  "message": "Payment confirmed successfully",
  "payment": { ... }
}
```

### Get Payment History

**Endpoint**: `GET /api/payments/history`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "payments": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "auction": {
        "_id": "507f1f77bcf86cd799439011",
        "itemName": "Vintage MacBook Pro",
        "images": ["https://example.com/image1.jpg"]
      },
      "amount": 1300,
      "status": "completed",
      "createdAt": "2026-01-30T13:00:00.000Z"
    }
  ]
}
```

---

## Notifications

### Get Notifications

**Endpoint**: `GET /api/notifications`

**Headers**: 
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit`: Number of results (default: 20)
- `page`: Page number (default: 1)
- `unreadOnly`: Boolean (default: false)

**Response** (200):
```json
{
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "type": "outbid",
      "title": "You've been outbid",
      "message": "You've been outbid on \"Vintage MacBook Pro\". Current bid is now $1300",
      "read": false,
      "relatedAuction": "507f1f77bcf86cd799439011",
      "createdAt": "2026-01-30T12:00:00.000Z"
    }
  ],
  "total": 10,
  "unreadCount": 5
}
```

### Mark as Read

**Endpoint**: `PUT /api/notifications/:id/read`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Notification marked as read"
}
```

### Mark All as Read

**Endpoint**: `PUT /api/notifications/read-all`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "All notifications marked as read"
}
```

### Get Unread Count

**Endpoint**: `GET /api/notifications/unread-count`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "unreadCount": 5
}
```

### Delete Notification

**Endpoint**: `DELETE /api/notifications/:id`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Notification deleted"
}
```

---

## Users

### Get User Profile

**Endpoint**: `GET /api/users/profile`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "rating": 4.5,
    "totalReviews": 10,
    "verified": false,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Update Profile

**Endpoint**: `PUT /api/users/profile`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Smith"
}
```

**Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Get Won Auctions

**Endpoint**: `GET /api/users/won-auctions`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "auctions": [ ... ]
}
```

### Get Purchase History

**Endpoint**: `GET /api/users/purchase-history`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "purchases": [ ... ]
}
```

### Get Seller Earnings

**Endpoint**: `GET /api/users/earnings`

**Headers**: 
```
Authorization: Bearer <token>
```

**Access**: Seller or Hybrid role required

**Response** (200):
```json
{
  "totalEarnings": 5000,
  "pendingEarnings": 500,
  "completedEarnings": 4500,
  "transactions": [ ... ]
}
```

---

## Reviews

### Create Review

**Endpoint**: `POST /api/reviews`

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "sellerId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Great seller, fast shipping!"
}
```

**Response** (201):
```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439019",
    "buyer": "507f1f77bcf86cd799439013",
    "seller": "507f1f77bcf86cd799439012",
    "rating": 5,
    "comment": "Great seller, fast shipping!",
    "createdAt": "2026-01-30T14:00:00.000Z"
  }
}
```

### Get Seller Reviews

**Endpoint**: `GET /api/reviews/seller/:sellerId`

**Headers**: None (public)

**Response** (200):
```json
{
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "buyer": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe"
      },
      "rating": 5,
      "comment": "Great seller, fast shipping!",
      "createdAt": "2026-01-30T14:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 10
}
```

### Get My Reviews

**Endpoint**: `GET /api/reviews/my-reviews`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "reviews": [ ... ]
}
```

---

## Contact

### Submit Contact Form

**Endpoint**: `POST /api/contact`

**Headers**: 
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about..."
}
```

**Response** (201):
```json
{
  "message": "Contact form submitted successfully"
}
```
