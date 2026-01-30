# CORS & Security

## Allowed Origins

**Development**:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Create React App default)

**Production**: Configure via `FRONTEND_URL` environment variable

**Multiple Origins**: Backend supports array of origins:
```javascript
origin: ["http://localhost:5173", "http://localhost:3000"]
```

## Required Headers

### Request Headers

**For Authenticated Requests**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**For Public Requests**:
```
Content-Type: application/json
```

### Response Headers

Backend automatically sets:
```
Access-Control-Allow-Origin: <frontend_url>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
```

## Credentials

**Cookies**: Not used. Authentication is token-based via headers.

**Credentials Mode**: `credentials: true` is set for CORS, but tokens are sent via headers, not cookies.

## Frontend Implementation

### Fetch API

```javascript
fetch('http://localhost:5001/api/auctions', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include' // Optional, not required for token auth
});
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Not needed for token auth
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Security Features

### Helmet.js

Backend uses Helmet.js for security headers:
- XSS Protection
- Content Security Policy
- Frame Options
- HSTS (in production)

### Rate Limiting

**Status**: Ready for implementation (express-rate-limit installed)

**Current**: Not actively enforced

**Recommendation**: Implement rate limiting for production:
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes

### Input Validation

All endpoints use `express-validator` for input validation:
- Required fields
- Type validation
- Format validation (email, dates, etc.)
- Custom validation rules

### Password Security

- Passwords are hashed using bcrypt
- Minimum 8 characters
- Must contain letter and number
- Never returned in API responses

### Token Security

- JWT tokens signed with secret key
- Tokens expire (default: 7 days)
- Tokens validated on every request
- Invalid tokens return 401

## Production Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable rate limiting
- [ ] Use HTTPS only
- [ ] Configure CORS for specific domains only
- [ ] Enable Helmet security headers
- [ ] Validate all inputs
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Never commit `.env` file
- [ ] Rotate secrets regularly
- [ ] Monitor for suspicious activity
- [ ] Implement request logging
- [ ] Use secure MongoDB connection (SSL/TLS)

## Known Limitations

1. **No token refresh mechanism**: Tokens expire, users must re-login
2. **No rate limiting**: Currently not enforced (ready to enable)
3. **No IP whitelisting**: All origins in CORS config are allowed
4. **No request size limits**: Should be configured for production
5. **No API versioning**: All endpoints are `/api/*`

## Breaking Changes

None currently. Future changes will be versioned if needed.
