# 🚀 Setup Instructions - CreatorFlow

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Create a `.env` file in the root directory with the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/creatorflow

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this

# Gemini API Key (for AI features)
GEMINI_API_KEY=your-gemini-api-key-here

# Cloudinary (optional - for media uploads)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Node Environment
NODE_ENV=development

# Server Port
PORT=5000
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
# If MongoDB is installed as a service, it should start automatically
# Or start manually:
mongod
```

**Mac/Linux:**
```bash
# Using Homebrew (Mac)
brew services start mongodb-community

# Or manually
mongod
```

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Start Backend Server
```bash
# Development (with auto-reload)
npm run dev:server

# Or production mode
npm start
```

The backend should now be running on: **http://localhost:5000**

### 5. Start Frontend (in a new terminal)
```bash
npm run dev
```

The frontend should now be running on: **http://localhost:5173**

## ✅ Verification

1. **Backend Health Check:**
   - Open: http://localhost:5000
   - Should see: `{"ok":true,"message":"Creator Flow API is running!"}`

2. **Frontend:**
   - Open: http://localhost:5173
   - Should see the login page

3. **API Test:**
   - Open: http://localhost:5000/api/auth/register
   - Should see an error (expected - need POST with body)

## 🔧 Troubleshooting

### Backend won't start

**Error: "MONGODB_URI is not set"**
- Create a `.env` file in the root directory
- Add `MONGODB_URI=mongodb://localhost:27017/creatorflow`

**Error: "MongoDB connection failed"**
- Make sure MongoDB is running
- Check if MongoDB is on port 27017
- Verify the connection string in `.env`

**Error: "Port 5000 already in use"**
- Change PORT in `.env` to a different port (e.g., 5001)
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill
  ```

**Error: "Cannot find module"**
- Run `npm install` to install all dependencies
- Check if you're in the correct directory

### Frontend can't connect to backend

**CORS Error:**
- Backend CORS is configured to allow localhost in development
- Make sure backend is running on port 5000
- Check browser console for specific error

**Network Error:**
- Verify `VITE_API_URL` is not set (should use proxy in development)
- Check that backend is running
- Verify vite.config.js has proxy configuration

## 📝 Available Scripts

- `npm start` - Start backend server (production)
- `npm run dev:server` - Start backend with nodemon (development)
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## 🎯 Next Steps

1. Register a new user account
2. Login with your credentials
3. Start using the application!

---

**Need Help?** Check the console logs for detailed error messages.




