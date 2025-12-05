# Authentication API Documentation

This document describes the authentication endpoints and how to use them.

## Base URL
```
http://localhost:5000/api/auth
```

## Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "themePreference": "system",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Validation:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

---

### 2. Login User
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "themePreference": "dark",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User (Protected)
**GET** `/api/auth/me`

Get current authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "themePreference": "dark",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

---

## Authentication Flow

1. **Register or Login** to receive a JWT token
2. **Store the token** (localStorage, sessionStorage, or secure cookie)
3. **Include token in requests** to protected routes:
   ```
   Authorization: Bearer <your-token>
   ```

## Using the API

### Example: Register User (JavaScript/Fetch)
```javascript
const registerUser = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('token', data.token);
    console.log('User registered:', data.user);
  } else {
    console.error('Error:', data.message);
  }
};
```

### Example: Login User
```javascript
const loginUser = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'password123',
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    console.log('Logged in:', data.user);
  }
};
```

### Example: Get Current User (Protected Route)
```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Current user:', data.user);
  } else {
    // Token might be expired or invalid
    localStorage.removeItem('token');
    console.error('Error:', data.message);
  }
};
```

### Example: Using with Axios
```javascript
import axios from 'axios';

// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// Register
const register = async (userData) => {
  const { data } = await axios.post('/api/auth/register', userData);
  if (data.success) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Login
const login = async (credentials) => {
  const { data } = await axios.post('/api/auth/login', credentials);
  if (data.success) {
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  }
  return data;
};

// Get current user
const getMe = async () => {
  const { data } = await axios.get('/api/auth/me');
  return data;
};
```

## Security Features

1. **Password Hashing**: Passwords are automatically hashed using bcrypt before saving
2. **JWT Tokens**: Secure token-based authentication
3. **Token Expiration**: Tokens expire after 30 days
4. **Password Exclusion**: Passwords are never returned in API responses
5. **Email Validation**: Email format is validated
6. **Unique Emails**: Duplicate email addresses are prevented

## Environment Variables Required

Make sure your `.env` file includes:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or token)
- `404` - Not Found
- `500` - Server Error


