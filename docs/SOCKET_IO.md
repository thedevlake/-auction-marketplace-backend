# Socket.io Real-Time Contract

## Connection

**Base URL**: `http://localhost:5001` (same as API, no `/api` prefix)

**Connection**:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: {
    token: localStorage.getItem('token') // Optional, for authenticated connections
  }
});
```

## Events Frontend Must Emit

### Join Auction Room

**Event**: `join-auction`

**Payload**:
```javascript
socket.emit('join-auction', auctionId);
```

**Example**:
```javascript
socket.emit('join-auction', '507f1f77bcf86cd799439011');
```

**Purpose**: Subscribe to real-time updates for a specific auction.

**When to Emit**: When user views an auction detail page.

### Leave Auction Room

**Event**: `leave-auction`

**Payload**:
```javascript
socket.emit('leave-auction', auctionId);
```

**Example**:
```javascript
socket.emit('leave-auction', '507f1f77bcf86cd799439011');
```

**Purpose**: Unsubscribe from auction updates.

**When to Emit**: When user navigates away from auction detail page.

## Events Backend Emits

### New Bid

**Event**: `new-bid`

**Room**: `auction-{auctionId}` (only users who joined the room receive this)

**Payload**:
```json
{
  "auctionId": "507f1f77bcf86cd799439011",
  "currentBid": 1300,
  "highestBidder": "John Doe",
  "numberOfBids": 6
}
```

**Frontend Handling**:
```javascript
socket.on('new-bid', (data) => {
  // Update auction state
  setAuction(prev => ({
    ...prev,
    currentBid: data.currentBid,
    highestBidder: { name: data.highestBidder },
    numberOfBids: data.numberOfBids
  }));
  
  // Add to bid history
  setBidHistory(prev => [{
    _id: Date.now(),
    bidder: { name: data.highestBidder },
    bidAmount: data.currentBid,
    createdAt: new Date().toISOString()
  }, ...prev]);
});
```

**When Emitted**: Immediately after a bid is placed (manual or auto-bid).

### Connection Events

**Event**: `connect`

**Payload**: None

**Frontend Handling**:
```javascript
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});
```

**Event**: `disconnect`

**Payload**: None

**Frontend Handling**:
```javascript
socket.on('disconnect', () => {
  console.log('Socket disconnected');
  // Optionally attempt reconnection
});
```

## Room Behavior

### Room Naming Convention

- Format: `auction-{auctionId}`
- Example: `auction-507f1f77bcf86cd799439011`

### Joining Rooms

Users must explicitly join a room to receive updates for that auction:

```javascript
// When viewing auction detail page
useEffect(() => {
  if (socket && auctionId) {
    socket.emit('join-auction', auctionId);
    
    return () => {
      socket.emit('leave-auction', auctionId);
    };
  }
}, [socket, auctionId]);
```

### Multiple Rooms

Users can join multiple auction rooms simultaneously:

```javascript
// User viewing multiple auctions (e.g., in watchlist)
socket.emit('join-auction', 'auction1');
socket.emit('join-auction', 'auction2');
socket.emit('join-auction', 'auction3');
```

## Complete Frontend Implementation Example

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function AuctionDetail({ auctionId }) {
  const [socket, setSocket] = useState(null);
  const [auction, setAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5001', {
      auth: token ? { token } : undefined
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Listen for new bids
    newSocket.on('new-bid', (data) => {
      if (data.auctionId === auctionId) {
        setAuction(prev => ({
          ...prev,
          currentBid: data.currentBid,
          highestBidder: { name: data.highestBidder },
          numberOfBids: data.numberOfBids
        }));

        setBidHistory(prev => [{
          _id: Date.now(),
          bidder: { name: data.highestBidder },
          bidAmount: data.currentBid,
          createdAt: new Date().toISOString()
        }, ...prev]);
      }
    });

    setSocket(newSocket);

    // Join auction room
    if (auctionId) {
      newSocket.emit('join-auction', auctionId);
    }

    // Cleanup
    return () => {
      if (auctionId) {
        newSocket.emit('leave-auction', auctionId);
      }
      newSocket.close();
    };
  }, [auctionId]);

  // ... rest of component
}
```

## Error Handling

Socket.io handles reconnection automatically. However, frontend should handle connection states:

```javascript
const [isConnected, setIsConnected] = useState(false);

socket.on('connect', () => {
  setIsConnected(true);
});

socket.on('disconnect', () => {
  setIsConnected(false);
});

// Show connection status to user
if (!isConnected) {
  return <div>Reconnecting...</div>;
}
```

## Authentication

Socket connections can optionally include authentication token:

```javascript
const socket = io('http://localhost:5001', {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

**Note**: Authentication is optional. Unauthenticated users can still receive public auction updates.

## Best Practices

1. **Join rooms only when needed**: Don't join all auctions at once
2. **Clean up on unmount**: Always leave rooms and close connections
3. **Handle reconnection**: Socket.io auto-reconnects, but update UI accordingly
4. **Validate data**: Always validate incoming socket data before updating state
5. **Debounce updates**: For high-frequency updates, consider debouncing UI updates
