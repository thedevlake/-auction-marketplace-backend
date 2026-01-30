# Seed / Mock Data

## Running the Seed Script

```bash
npm run seed
```

This will:
1. Connect to MongoDB
2. Create a demo seller account (if doesn't exist)
3. Clear existing demo auctions
4. Create 8 sample auctions with various categories and statuses

## Demo Users

### Seller Account

**Email**: `seller@demo.com`  
**Password**: `demo123456`  
**Role**: `seller`

**Use Case**: Test seller functionality, create auctions, manage listings

### Creating Buyer Account

Buyer accounts are not pre-seeded. Create via registration:

```bash
POST /api/auth/register
{
  "name": "Demo Buyer",
  "email": "buyer@demo.com",
  "password": "demo123456"
}
```

**Use Case**: Test bidding, watchlist, purchases

## Sample Auctions

The seed script creates 8 auctions across different categories:

### 1. Vintage MacBook Pro 16"
- **Category**: Tech
- **Starting Price**: $1,200
- **Current Bid**: $1,250
- **Status**: Live
- **Tags**: New, Trending
- **Bids**: 5
- **End Time**: 7 days from seed

### 2. Designer Leather Jacket
- **Category**: Fashion
- **Starting Price**: $450
- **Current Bid**: $520
- **Status**: Live
- **Tags**: New, High Demand
- **Bids**: 8
- **End Time**: 3 days from seed

### 3. Rare Collectible Watch
- **Category**: Collectibles
- **Starting Price**: $2,500
- **Current Bid**: $3,200
- **Status**: Live
- **Tags**: Trending, Ending Soon
- **Bids**: 12
- **End Time**: 1 day from seed

### 4. Professional Camera Kit
- **Category**: Tech
- **Starting Price**: $1,800
- **Current Bid**: $1,800 (no bids yet)
- **Status**: Live
- **Tags**: New
- **Bids**: 0
- **End Time**: 5 days from seed

### 5. Luxury Handbag Collection
- **Category**: Fashion
- **Starting Price**: $800
- **Current Bid**: $950
- **Status**: Live
- **Tags**: Trending, High Demand
- **Bids**: 6
- **End Time**: 4 days from seed

### 6. Vintage Vinyl Records
- **Category**: Collectibles
- **Starting Price**: $300
- **Current Bid**: $350
- **Status**: Live
- **Tags**: No Reserve
- **Bids**: 3
- **End Time**: 6 days from seed

### 7. Smart Home System
- **Category**: Tech
- **Starting Price**: $600
- **Current Bid**: $600 (no bids yet)
- **Status**: Live
- **Tags**: New, Trending
- **Bids**: 0
- **End Time**: 10 days from seed

### 8. Artisan Coffee Set
- **Category**: Daily
- **Starting Price**: $150
- **Current Bid**: $180
- **Status**: Live
- **Tags**: New
- **Bids**: 4
- **End Time**: 2 days from seed

## Test Credentials Summary

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Seller | `seller@demo.com` | `demo123456` | Create/manage auctions |
| Buyer | `buyer@demo.com` | `demo123456` | Bid, watchlist, purchase |

**Note**: Buyer account must be created manually via registration endpoint.

## Resetting Seed Data

To reset and re-seed:

```bash
npm run seed
```

This will:
- Keep existing seller account
- Delete all auctions created by the seller
- Create fresh sample auctions

## Custom Seed Data

To modify seed data, edit `scripts/seedDemoData.js`:

```javascript
const demoAuctions = [
  {
    itemName: "Your Item",
    description: "Description here",
    category: "Tech",
    startingPrice: 1000,
    // ... other fields
  }
];
```

## Image URLs

Seed data uses placeholder images from Picsum Photos:
- Format: `https://picsum.photos/800/600?random={id}`
- These are reliable placeholder images for development

For production, replace with actual image URLs or implement image upload.

## Development Workflow

1. **Start Backend**: `npm run dev`
2. **Seed Data**: `npm run seed`
3. **Login as Seller**: Use `seller@demo.com` / `demo123456`
4. **Create Buyer**: Register new account
5. **Test Features**: Use seeded auctions for testing

## Data Persistence

- Seed data persists in MongoDB
- Re-running seed script replaces existing demo auctions
- User accounts persist unless manually deleted
- Real user data (non-demo) is not affected by seed script
