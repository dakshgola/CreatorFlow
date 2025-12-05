# Backend Setup Guide

This guide explains how to set up and run the Express backend server.

## Files Created

1. **`server.js`** - Main Express server file
2. **`config/db.js`** - MongoDB connection configuration
3. **`nodemon.json`** - Nodemon configuration for auto-restart

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/creatorflow

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration (for image uploads - optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev:server
```

### Production Mode
```bash
npm start
```

## Testing the Server

Once the server is running, test it by visiting:
```
http://localhost:5000
```

You should see:
```json
{ "ok": true }
```

## Project Structure

```
CREATORFLOW/
├── server.js              # Main server file
├── config/
│   └── db.js              # MongoDB connection
├── routes/                 # API routes (to be created)
├── models/                 # Mongoose models (to be created)
├── controllers/            # Route controllers (to be created)
└── middleware/            # Custom middleware (to be created)
```

## Next Steps

1. Create API routes in `routes/` directory
2. Create Mongoose models in `models/` directory
3. Add authentication middleware
4. Connect frontend to backend API


