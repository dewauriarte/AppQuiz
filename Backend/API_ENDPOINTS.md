# 🔑 API Endpoints - AppQuiz Backend

## Base URL
```
http://localhost:4000/api/v1
```

---

## 🔓 Public Endpoints (No Auth Required)

### 1. Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "student123",
  "email": "student@example.com", // optional
  "password": "MySecurePass123",
  "role": "student", // "student" | "teacher"
  "displayName": "John Doe" // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "student123",
      "email": "student@example.com",
      "role": "student",
      "displayName": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User registered successfully"
}
```

---

### 2. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "student123",
  "password": "MySecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "student123",
      "email": "student@example.com",
      "role": "student",
      "displayName": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

---

### 3. Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If email exists, reset instructions were sent"
}
```

**Note:** Implementación básica. TODO: Enviar email real.

---

### 4. Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Note:** Implementación básica. TODO: Verificar token real.

---

## 🔒 Protected Endpoints (Auth Required)

**Headers Required:**
```http
Authorization: Bearer <accessToken>
```

AI Provider headers (optional, per-request override):
```http
x-anthropic-key: sk-ant-...   # Claude (Anthropic)
x-google-ai-key: ...          # Gemini (Google)
x-openai-key: sk-...          # OpenAI
x-api-key: sk-ant-...         # alias for Claude
```

### 5. Get Current User
```http
GET /auth/me
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "student123",
    "email": "student@example.com",
    "role": "student",
    "display_name": "John Doe",
    "is_active": true,
    "created_at": "2025-01-10T12:00:00.000Z"
  }
}
```

---

### 6. Update Profile
```http
PUT /auth/profile
```

**Request Body:**
```json
{
  "displayName": "Jane Doe",
  "email": "newemail@example.com" // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "student123",
    "email": "newemail@example.com",
    "role": "student",
    "display_name": "Jane Doe"
  },
  "message": "Profile updated successfully"
}
```

---

### 7. Logout
```http
POST /auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🏥 Health Check

### 8. Server Health
```http
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔐 Authentication Flow

1. **Register/Login** → Get `accessToken` + `refreshToken`
2. Store tokens in localStorage/cookies
3. Include `accessToken` in `Authorization: Bearer <token>` header
4. On 401 error → Try refresh (TODO: implement refresh endpoint)
5. If refresh fails → Logout and redirect to login

---

## 📝 Notes

- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Failed login attempts are tracked
- Account locks after too many failed attempts
- Password reset flow is basic (TODO: implement email service)

