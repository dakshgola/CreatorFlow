# Media API Documentation

This document describes the Media upload and management endpoints.

## Base URL
```
http://localhost:5000/api/media
```

**All endpoints require authentication.** Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### 1. Upload Media
**POST** `/api/media/upload`

Upload an image file to Cloudinary and save the media record to the database.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `image` (file): Image file to upload (required)
  - Supported formats: JPEG, JPG, PNG, GIF, WebP
  - Max file size: 10MB

**Success Response (201):**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/creatorflow/user123/image.jpg",
    "publicId": "creatorflow/user123/image",
    "filename": "my-image.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "No file uploaded. Please provide an image file."
}
```

**Validation:**
- File must be provided
- Only image files allowed (JPEG, PNG, GIF, WebP)
- Maximum file size: 10MB

---

### 2. Get All Media
**GET** `/api/media`

Get all media files belonging to the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "url": "https://res.cloudinary.com/...",
      "publicId": "creatorflow/user123/image1",
      "filename": "image1.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "width": 1920,
      "height": 1080,
      "format": "jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Media
**GET** `/api/media/:id`

Get a single media file by ID (must belong to authenticated user).

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
    "url": "https://res.cloudinary.com/...",
    "publicId": "creatorflow/user123/image",
    "filename": "my-image.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Media not found"
}
```

---

### 4. Delete Media
**DELETE** `/api/media/:id`

Delete media from both Cloudinary and the database (must belong to authenticated user).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "data": {}
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Media not found"
}
```

---

## Usage Examples

### JavaScript/Fetch Examples

#### Upload Image
```javascript
const uploadImage = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:5000/api/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type header - browser will set it with boundary
    },
    body: formData,
  });

  const data = await response.json();
  return data;
};

// Usage with file input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await uploadImage(file);
    console.log('Uploaded:', result.data.url);
  }
});
```

#### Get All Media
```javascript
const getMedia = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/media', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};
```

#### Delete Media
```javascript
const deleteMedia = async (mediaId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:5000/api/media/${mediaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};
```

### React Example with File Input
```jsx
import { useState } from 'react';

const ImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImageUrl(data.data.url);
        console.log('Image uploaded:', data.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
};
```

### Axios Example
```javascript
import axios from 'axios';

// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// Upload image
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios.post('/api/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

// Get all media
const getMedia = async () => {
  const { data } = await axios.get('/api/media');
  return data;
};

// Delete media
const deleteMedia = async (id) => {
  const { data } = await axios.delete(`/api/media/${id}`);
  return data;
};
```

## Environment Variables Required

Make sure your `.env` file includes Cloudinary configuration:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Or use CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## Features

1. **Automatic Image Optimization**: Cloudinary automatically optimizes images
2. **User Isolation**: Users can only access their own media
3. **File Validation**: Only images allowed, max 10MB
4. **Organized Storage**: Files organized by user ID in Cloudinary
5. **Secure URLs**: Uses Cloudinary secure URLs (HTTPS)
6. **CDN Caching**: Cloudinary provides CDN for fast delivery
7. **Automatic Cleanup**: Deletes from both Cloudinary and database

## File Organization in Cloudinary

Files are organized in the following structure:
```
creatorflow/
  └── {userId}/
      └── {filename}
```

Example:
```
creatorflow/507f1f77bcf86cd799439012/my-image.jpg
```

## Status Codes

- `200` - Success (GET, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors, invalid file)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (media doesn't exist or doesn't belong to user)
- `500` - Server Error

## Notes

- Images are automatically optimized by Cloudinary
- Files are stored in memory temporarily before upload (using multer memory storage)
- Maximum file size is 10MB
- Only image files are accepted (JPEG, PNG, GIF, WebP)
- Media records are automatically associated with the authenticated user
- Deleting media removes it from both Cloudinary and the database


