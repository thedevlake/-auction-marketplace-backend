# Environment Variables

## .env.example

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5001
NODE_ENV=development

# ============================================
# DATABASE (REQUIRED)
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auction-marketplace?retryWrites=true&w=majority

# ============================================
# JWT AUTHENTICATION (REQUIRED)
# ============================================
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# ============================================
# FRONTEND URL (REQUIRED for CORS)
# ============================================
FRONTEND_URL=http://localhost:5173

# ============================================
# STRIPE PAYMENT (OPTIONAL)
# ============================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================
# EMAIL NOTIFICATIONS (OPTIONAL)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Variable Descriptions

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `5001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT token signing | `your_secret_key_here` |
| `JWT_EXPIRE` | Token expiration time | `7d`, `24h`, `3600s` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Optional Variables

| Variable | Description | Default | Required For |
|----------|-------------|---------|--------------|
| `NODE_ENV` | Environment mode | `development` | Production deployment |
| `STRIPE_SECRET_KEY` | Stripe API secret key | - | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - | Payment webhooks |
| `EMAIL_HOST` | SMTP server host | - | Email notifications |
| `EMAIL_PORT` | SMTP server port | - | Email notifications |
| `EMAIL_USER` | SMTP username | - | Email notifications |
| `EMAIL_PASS` | SMTP password/app password | - | Email notifications |

## Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in required variables:
   - `MONGODB_URI`: Get from MongoDB Atlas or local MongoDB
   - `JWT_SECRET`: Generate a secure random string (minimum 32 characters)
   - `FRONTEND_URL`: Your frontend development URL

3. Generate JWT Secret:
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Or use online generator
   # https://randomkeygen.com/
   ```

4. Optional: Configure Stripe (for payments):
   - Get keys from: https://dashboard.stripe.com/apikeys
   - Use test keys for development

5. Optional: Configure Email (for notifications):
   - Gmail: Use App Password (not regular password)
   - Other providers: Use their SMTP settings

## Production Considerations

- **Never commit `.env` file** to version control
- Use environment-specific values:
  - Development: `NODE_ENV=development`
  - Production: `NODE_ENV=production`
- Use secure secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly
- Use strong JWT secrets (minimum 64 characters recommended for production)

## Frontend Environment Variables

Frontend should use:

```env
VITE_API_URL=http://localhost:5001/api
```

Or for production:

```env
VITE_API_URL=https://api.yourdomain.com/api
```
