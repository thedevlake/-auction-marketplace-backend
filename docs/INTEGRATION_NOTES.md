# Frontend Integration Notes

## Known Limitations

### 1. Token Refresh
- **Issue**: No automatic token refresh mechanism
- **Impact**: Users must re-login after token expiry (default: 7 days)
- **Workaround**: Implement frontend token expiry check and redirect to login
- **Future**: Token refresh endpoint may be added

### 2. Image Upload
- **Issue**: Image URLs must be provided as strings (no file upload endpoint)
- **Impact**: Frontend must handle image upload to external service (e.g., Cloudinary, AWS S3)
- **Workaround**: Accept image URLs from users or implement third-party upload
- **Future**: File upload endpoint may be added

### 3. Pagination
- **Issue**: Some endpoints return all results without pagination
- **Impact**: Large datasets may cause performance issues
- **Workaround**: Implement frontend pagination or limit requests
- **Affected Endpoints**: 
  - `GET /api/watchlist`
  - `GET /api/bids/active`
  - `GET /api/bids/history`

### 4. Search Functionality
- **Issue**: Basic search only (no advanced filters)
- **Impact**: Limited search capabilities
- **Workaround**: Use category and status filters
- **Future**: Advanced search may be added

### 5. Real-Time Updates
- **Issue**: Only bid updates are real-time
- **Impact**: Auction status changes (ended, won) may not update in real-time
- **Workaround**: Poll auction status or implement additional socket events
- **Future**: More socket events may be added

### 6. Auto-Bid Behavior
- **Issue**: Auto-bid updates may not be immediate
- **Impact**: Slight delay in auto-bid processing
- **Workaround**: Poll auction data or wait for socket update
- **Note**: This is expected behavior for auto-bid processing

## Breaking Change Warnings

### None Currently

All endpoints are stable. Future breaking changes will be:
1. Versioned (e.g., `/api/v2/...`)
2. Documented in release notes
3. Deprecated endpoints will have 6-month grace period

## TODOs That May Affect Frontend

### High Priority

1. **Rate Limiting**
   - **Status**: Ready to implement
   - **Impact**: May limit rapid API calls
   - **Action**: Implement request throttling on frontend

2. **Image Upload Endpoint**
   - **Status**: Planned
   - **Impact**: Will change auction creation flow
   - **Action**: Prepare for multipart/form-data requests

3. **Pagination Improvements**
   - **Status**: Planned
   - **Impact**: Will change response structure
   - **Action**: Use cursor-based pagination where possible

### Medium Priority

4. **Token Refresh**
   - **Status**: Planned
   - **Impact**: Will change authentication flow
   - **Action**: Prepare for refresh token handling

5. **WebSocket Authentication**
   - **Status**: Partial (optional)
   - **Impact**: May require authenticated socket connections
   - **Action**: Include token in socket connection

6. **Advanced Search**
   - **Status**: Planned
   - **Impact**: Will add new query parameters
   - **Action**: Backward compatible, no changes needed

### Low Priority

7. **API Versioning**
   - **Status**: Future consideration
   - **Impact**: Will add version prefix
   - **Action**: Use versioned endpoints when available

8. **GraphQL Support**
   - **Status**: Future consideration
   - **Impact**: Alternative API interface
   - **Action**: REST API will remain available

## Best Practices

### Error Handling

Always handle these error scenarios:

```javascript
try {
  const response = await api.get('/auctions');
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - redirect to login
    redirectToLogin();
  } else if (error.response?.status === 403) {
    // Insufficient permissions
    showError('You do not have permission for this action');
  } else if (error.response?.status === 404) {
    // Resource not found
    showError('Auction not found');
  } else if (error.response?.status === 400) {
    // Validation error
    const errors = error.response.data.errors;
    showValidationErrors(errors);
  } else {
    // Server error
    showError('Something went wrong. Please try again.');
  }
}
```

### Loading States

Implement loading states for:
- Initial data fetch
- Form submissions
- Real-time updates
- Image loading

### Optimistic Updates

For better UX, consider optimistic updates:
- Bid placement (update UI immediately, rollback on error)
- Watchlist toggle (update UI immediately)
- Notification read status

### Caching

Consider caching:
- Auction lists (with TTL)
- User profile data
- Watchlist status

### Real-Time Updates

Best practices:
- Join rooms only when viewing auction detail
- Leave rooms on component unmount
- Handle reconnection gracefully
- Show connection status to users

## Testing Recommendations

### Unit Tests
- API service functions
- Token management
- Error handling
- Data transformation

### Integration Tests
- Authentication flow
- Bid placement
- Watchlist operations
- Payment flow

### E2E Tests
- Complete auction flow (create → bid → win → pay)
- User registration and login
- Real-time bid updates

## Performance Considerations

1. **Image Optimization**: Compress images before sending URLs
2. **Lazy Loading**: Load auction lists incrementally
3. **Debouncing**: Debounce search inputs
4. **Memoization**: Memoize expensive computations
5. **Virtual Scrolling**: For long lists

## Security Considerations

1. **Token Storage**: Use secure storage (httpOnly cookies in production)
2. **XSS Prevention**: Sanitize user inputs
3. **CSRF**: Not applicable (token-based auth)
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate on frontend AND trust backend validation

## Support

For issues or questions:
1. Check this documentation first
2. Review API responses for error messages
3. Check browser console for CORS/network errors
4. Verify environment variables are set correctly
5. Ensure backend is running and accessible
