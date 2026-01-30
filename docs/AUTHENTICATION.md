# Authentication Flow

## Overview

The API uses JWT (JSON Web Tokens) for authentication. Tokens are issued upon successful login and must be included in all authenticated requests.

## Flow Diagram

```
1. User Registration → POST /api/auth/register
   ↓
2. User Login → POST /api/auth/login
   ↓
3. Receive Token + User Data
   ↓
4. Store Token (localStorage/sessionStorage)
   ↓
5. Include Token in Subsequent Requests
   Authorization: Bearer <token>
```

## Registration

**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one letter
- At least one number

**Response**:
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

**Note**: Registration does NOT return a token. User must login after registration.

## Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTYxOTg1NjAwMCwiZXhwIjoxNjIwNDYwODAwfQ.xxx",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "rating": 0
  }
}
```

## Token Storage

**Frontend Implementation**:

```javascript
// After successful login
const { token, user } = await login(email, password);

// Store token
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Or use sessionStorage for session-only storage
sessionStorage.setItem('token', token);
```

## Token Usage

**Include in Request Headers**:

```javascript
// Using fetch
fetch('http://localhost:5001/api/auctions', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

// Using axios
axios.get('http://localhost:5001/api/auctions', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Or use axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Token Expiry

- **Default Expiry**: 7 days
- **Configurable**: Set via `JWT_EXPIRE` environment variable
- **Format**: `7d`, `24h`, `3600s`, etc.

## Token Refresh

**Current Behavior**: No automatic refresh mechanism.

**Frontend Handling**:

```javascript
// Check token expiry before requests
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Get Current User

**Endpoint**: `GET /api/auth/me`

**Use Case**: Verify token validity and get updated user data.

**Response**:
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

## User Roles

- **buyer**: Can bid, add to watchlist, make purchases
- **seller**: Can create auctions, manage listings
- **hybrid**: Can do both buyer and seller actions

## Optional Authentication

Some endpoints support optional authentication (e.g., `GET /api/auctions`). If a token is provided, results may be personalized. If no token, public results are returned.

**Frontend Implementation**:

```javascript
// Include token if available, but don't require it
const headers = {};
const token = localStorage.getItem('token');
if (token) {
  headers.Authorization = `Bearer ${token}`;
}

fetch('http://localhost:5001/api/auctions', { headers });
```

## Error Handling

### 401 Unauthorized

**Causes**:
- Missing token
- Invalid token
- Expired token

**Response**:
```json
{
  "message": "Not authorized, no token"
}
```

or

```json
{
  "message": "Not authorized, token failed"
}
```

**Frontend Action**: Redirect to login page.

### 403 Forbidden

**Causes**:
- Insufficient role permissions (e.g., buyer trying to create auction)

**Response**:
```json
{
  "message": "Access denied. Seller privileges required."
}
```

**Frontend Action**: Show error message, possibly redirect to upgrade account.
