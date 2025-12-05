# Clients API Documentation

This document describes the Clients CRUD endpoints and how to use them.

## Base URL
```
http://localhost:5000/api/clients
```

**All endpoints require authentication.** Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### 1. Get All Clients
**GET** `/api/clients`

Get all clients belonging to the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "name": "Acme Corp",
      "niche": "E-commerce",
      "links": [
        {
          "platform": "Instagram",
          "url": "https://instagram.com/acme"
        }
      ],
      "paymentRate": 5000,
      "notes": "Prefers video content",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Client
**GET** `/api/clients/:id`

Get a single client by ID (must belong to authenticated user).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Acme Corp",
    "niche": "E-commerce",
    "links": [],
    "paymentRate": 5000,
    "notes": "",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Client not found"
}
```

---

### 3. Create Client
**POST** `/api/clients`

Create a new client.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Acme Corp",
  "niche": "E-commerce",
  "links": [
    {
      "platform": "Instagram",
      "url": "https://instagram.com/acme"
    },
    {
      "platform": "Twitter",
      "url": "https://twitter.com/acme"
    }
  ],
  "paymentRate": 5000,
  "notes": "Prefers video content, responds quickly"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Acme Corp",
    "niche": "E-commerce",
    "links": [...],
    "paymentRate": 5000,
    "notes": "Prefers video content, responds quickly",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide name, niche, and paymentRate"
}
```

**Validation:**
- `name`: Required, 2-100 characters
- `niche`: Required, max 50 characters
- `paymentRate`: Required, must be a positive number
- `links`: Optional array, max 10 links, URLs must be valid
- `notes`: Optional, max 2000 characters

---

### 4. Update Client
**PUT** `/api/clients/:id`

Update an existing client (must belong to authenticated user).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Acme Corporation",
  "niche": "E-commerce & Retail",
  "paymentRate": 6000,
  "notes": "Updated notes",
  "links": [
    {
      "platform": "Instagram",
      "url": "https://instagram.com/acme"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Acme Corporation",
    "niche": "E-commerce & Retail",
    "paymentRate": 6000,
    "notes": "Updated notes",
    "links": [...],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Client not found"
}
```

---

### 5. Delete Client
**DELETE** `/api/clients/:id`

Delete a client (must belong to authenticated user).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Client deleted successfully",
  "data": {}
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Client not found"
}
```

---

## Usage Examples

### JavaScript/Fetch Examples

#### Get All Clients
```javascript
const getClients = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/clients', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};
```

#### Create Client
```javascript
const createClient = async (clientData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/clients', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Acme Corp',
      niche: 'E-commerce',
      paymentRate: 5000,
      links: [
        { platform: 'Instagram', url: 'https://instagram.com/acme' }
      ],
      notes: 'Great client to work with',
    }),
  });

  const data = await response.json();
  return data;
};
```

#### Update Client
```javascript
const updateClient = async (clientId, updates) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  return data;
};
```

#### Delete Client
```javascript
const deleteClient = async (clientId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};
```

### Axios Examples

```javascript
import axios from 'axios';

// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// Get all clients
const getClients = async () => {
  const { data } = await axios.get('/api/clients');
  return data;
};

// Get single client
const getClient = async (id) => {
  const { data } = await axios.get(`/api/clients/${id}`);
  return data;
};

// Create client
const createClient = async (clientData) => {
  const { data } = await axios.post('/api/clients', clientData);
  return data;
};

// Update client
const updateClient = async (id, updates) => {
  const { data } = await axios.put(`/api/clients/${id}`, updates);
  return data;
};

// Delete client
const deleteClient = async (id) => {
  const { data } = await axios.delete(`/api/clients/${id}`);
  return data;
};
```

## Security Features

1. **Authentication Required**: All routes are protected by `authMiddleware`
2. **User Isolation**: Users can only access their own clients
3. **Validation**: All input is validated before saving
4. **Error Handling**: Consistent error responses with appropriate status codes

## Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (client doesn't exist or doesn't belong to user)
- `500` - Server Error

## Notes

- All clients are automatically associated with the authenticated user (`userId`)
- Users can only see, update, or delete their own clients
- Links array is limited to 10 items
- Payment rate must be a positive number
- All string fields are automatically trimmed


