# API Contract

## Base URLs

- **Local Development**: `http://localhost:5001/api`
- **Production**: `https://your-production-domain.com/api` (configure in environment)

## Authentication Method

**JWT Bearer Token**

All authenticated endpoints require the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Standard Response Formats

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

For single resource endpoints, data may be at root level:

```json
{
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Validation Error Response

```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

## Request Headers

### Required for Authenticated Endpoints

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Optional

```
Accept: application/json
```

## Response Headers

```
Content-Type: application/json
Access-Control-Allow-Origin: <frontend_url>
Access-Control-Allow-Credentials: true
```
