# Frontend Integration Documentation

Complete documentation for integrating with the Auction Marketplace Backend API.

## Quick Start

1. **Read**: [API Contract](./API_CONTRACT.md) - Base URLs, authentication, response formats
2. **Read**: [Authentication Flow](./AUTHENTICATION.md) - How to handle login and tokens
3. **Read**: [Endpoints](./ENDPOINTS.md) - All available API endpoints
4. **Read**: [Socket.io](./SOCKET_IO.md) - Real-time updates
5. **Read**: [Integration Notes](./INTEGRATION_NOTES.md) - Known limitations and best practices

## Documentation Index

### Core Documentation

- **[API Contract](./API_CONTRACT.md)** - Base URLs, authentication method, standard responses
- **[Endpoints](./ENDPOINTS.md)** - Complete endpoint reference with examples
- **[Authentication Flow](./AUTHENTICATION.md)** - Registration, login, token handling

### Real-Time

- **[Socket.io Contract](./SOCKET_IO.md)** - Real-time events, room management

### Configuration

- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Required and optional config
- **[CORS & Security](./CORS_SECURITY.md)** - Security expectations, headers

### Development

- **[Seed Data](./SEED_DATA.md)** - Demo data, test credentials
- **[Integration Notes](./INTEGRATION_NOTES.md)** - Limitations, TODOs, best practices

## Quick Reference

### Base URL
```
Development: http://localhost:5001/api
Production: https://your-domain.com/api
```

### Authentication
```
Header: Authorization: Bearer <token>
Token received from: POST /api/auth/login
Token expiry: 7 days (default)
```

### Real-Time
```
Socket URL: http://localhost:5001
Join room: socket.emit('join-auction', auctionId)
Listen: socket.on('new-bid', (data) => { ... })
```

## Common Tasks

### Register and Login
```javascript
// 1. Register
await fetch('http://localhost:5001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password })
});

// 2. Login
const response = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await response.json();

// 3. Store token
localStorage.setItem('token', token);
```

### Make Authenticated Request
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5001/api/auctions', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Real-Time Bid Updates
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: { token: localStorage.getItem('token') }
});

socket.emit('join-auction', auctionId);
socket.on('new-bid', (data) => {
  // Update UI with new bid
});
```

## Getting Help

1. Check the relevant documentation file
2. Review [Integration Notes](./INTEGRATION_NOTES.md) for known issues
3. Verify your environment variables are set correctly
4. Ensure backend is running and accessible
5. Check browser console for detailed error messages

## Version

**API Version**: 1.0.0  
**Last Updated**: January 2026
