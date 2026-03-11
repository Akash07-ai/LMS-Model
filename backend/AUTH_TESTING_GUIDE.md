# Authentication System - Complete Testing Guide

## ✅ What's Already Implemented

### Features:
- ✅ User registration with email validation
- ✅ User login with credential verification
- ✅ Access tokens (15 minutes expiry)
- ✅ Refresh tokens (30 days expiry)
- ✅ HTTP-only cookies for refresh tokens
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Refresh tokens stored in database
- ✅ Automatic token refresh on frontend
- ✅ Secure logout (token deletion)

### Endpoints:
```
POST   /auth/register   - Register new user
POST   /auth/login      - Login user
POST   /auth/refresh    - Refresh access token
POST   /auth/logout     - Logout user
GET    /users/me        - Get current user (protected)
```

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Select file: `backend/LMS_Auth_API.postman_collection.json`
4. Collection will be imported with all tests

---

## 📋 Manual Testing Steps

### Test 1: Register User

**Request:**
```
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Check:**
- ✅ Status: 201 Created
- ✅ Access token returned
- ✅ Cookie `refreshToken` set (check Cookies tab)
- ✅ User object returned

---

### Test 2: Login User

**Request:**
```
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Check:**
- ✅ Status: 200 OK
- ✅ Access token returned
- ✅ Cookie `refreshToken` set
- ✅ User object returned

---

### Test 3: Get Current User (Protected Route)

**Request:**
```
GET http://localhost:5000/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Check:**
- ✅ Status: 200 OK
- ✅ User data returned
- ✅ Without token: 401 Unauthorized

---

### Test 4: Refresh Access Token

**Request:**
```
POST http://localhost:5000/auth/refresh
```

**Note:** Refresh token is sent automatically via cookie

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Check:**
- ✅ Status: 200 OK
- ✅ New access token returned
- ✅ Works only if refresh cookie exists

---

### Test 5: Logout User

**Request:**
```
POST http://localhost:5000/auth/logout
```

**Expected Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Check:**
- ✅ Status: 200 OK
- ✅ Refresh token deleted from database
- ✅ Cookie cleared

---

## 🔒 Security Features

### Password Hashing
```typescript
// bcrypt with 10 salt rounds
const hashedPassword = await hashPassword(password);
```

### JWT Tokens
```typescript
// Access Token: 15 minutes
const accessToken = generateAccessToken(userId);

// Refresh Token: 30 days
const refreshToken = generateRefreshToken(userId);
```

### HTTP-Only Cookies
```typescript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});
```

---

## 🧪 Error Cases to Test

### 1. Register with Existing Email
```json
POST /auth/register
{
  "name": "Test",
  "email": "john@example.com",  // Already exists
  "password": "password123"
}

Response: 400 Bad Request
{
  "message": "Email already exists"
}
```

### 2. Login with Wrong Password
```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "wrongpassword"
}

Response: 401 Unauthorized
{
  "message": "Invalid credentials"
}
```

### 3. Access Protected Route Without Token
```
GET /users/me
(No Authorization header)

Response: 401 Unauthorized
{
  "message": "No token provided"
}
```

### 4. Access Protected Route with Expired Token
```
GET /users/me
Authorization: Bearer EXPIRED_TOKEN

Response: 401 Unauthorized
{
  "message": "Invalid or expired token"
}
```

### 5. Refresh Without Cookie
```
POST /auth/refresh
(No refresh token cookie)

Response: 401 Unauthorized
{
  "message": "No refresh token"
}
```

---

## 📊 Database Verification

### Check Users Table
```sql
SELECT id, email, name, created_at FROM users;
```

### Check Refresh Tokens
```sql
SELECT 
  rt.id,
  u.email,
  rt.expires_at,
  rt.created_at
FROM refresh_tokens rt
JOIN users u ON rt.user_id = u.id;
```

### Check Token Expiry
```sql
SELECT 
  u.email,
  rt.expires_at,
  CASE 
    WHEN rt.expires_at > NOW() THEN 'Valid'
    ELSE 'Expired'
  END AS status
FROM refresh_tokens rt
JOIN users u ON rt.user_id = u.id;
```

---

## 🚀 Quick Test Script

Run these commands in order:

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Test health
curl http://localhost:5000/health

# 3. Register user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 4. Login user
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Database connected
- [ ] Register new user (201 response)
- [ ] Access token received
- [ ] Refresh cookie set
- [ ] Login with credentials (200 response)
- [ ] Access protected route with token
- [ ] Refresh token works
- [ ] Logout clears cookie
- [ ] Password is hashed in database
- [ ] Duplicate email rejected
- [ ] Wrong password rejected
- [ ] Expired token rejected

---

## 🎯 Next Steps

After authentication is verified:
1. Build subject/video APIs
2. Implement sequential video unlocking
3. Add progress tracking
4. Build video player component

---

## 🔧 Troubleshooting

**Backend not running:**
```bash
cd backend
npm run dev
```

**Database connection failed:**
- Check MySQL is running
- Verify credentials in `.env`

**Token not working:**
- Check token format: `Bearer <token>`
- Verify token not expired
- Check Authorization header

**Cookie not set:**
- Check CORS settings
- Verify frontend URL in `.env`
- Check browser allows cookies
