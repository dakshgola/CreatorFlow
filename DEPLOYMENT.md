# Deployment Guide

This guide covers deploying the CreatorFlow application to production.

## Table of Contents
- [Backend Deployment (Render)](#backend-deployment-render)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Environment Variables](#environment-variables)
- [Docker Deployment (Optional)](#docker-deployment-optional)

---

## Backend Deployment (Render)

### Prerequisites
- GitHub repository with your code
- MongoDB Atlas account (or other MongoDB hosting)
- Render account (free tier available)

### Step 1: Prepare Your Repository
1. Ensure all your code is committed and pushed to GitHub
2. Make sure `Procfile` is in the root directory
3. Verify `package.json` has a `start` script: `"start": "node server.js"`

### Step 2: Create a New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your backend code

### Step 3: Configure the Service
- **Name**: `creatorflow-backend` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js` (or leave blank to use Procfile)
- **Plan**: Choose Free or Starter plan

### Step 4: Set Environment Variables
In the Render dashboard, go to **Environment** tab and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/creatorflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-secret-key-min-32-chars
GEMINI_API_KEY=your-google-gemini-api-key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NODE_ENV=production
PORT=10000
```

**Note**: Render automatically sets `PORT`, but you can override it. The default is usually `10000` for free tier.

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 2-5 minutes)
4. Your backend will be available at: `https://your-service-name.onrender.com`

### Step 6: Update CORS Settings (if needed)
If you need to allow specific frontend domains, update `server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
  credentials: true
}));
```

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository with your frontend code
- Vercel account (free tier available)
- Backend URL from Render deployment

### Step 1: Prepare Your Frontend
1. Update API base URL in `src/hooks/useApi.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

2. Create `vercel.json` in the root directory (optional, for custom configuration):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root of your repo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Set Environment Variables
In Vercel project settings → **Environment Variables**, add:

```
VITE_API_URL=https://your-backend-service.onrender.com/api
```

**Important**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

### Step 4: Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your application
3. Your frontend will be available at: `https://your-project.vercel.app`

### Step 5: Update Backend CORS
Update your Render backend to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'https://your-project.vercel.app',
    'http://localhost:5173' // for local development
  ],
  credentials: true
}));
```

---

## Environment Variables

### Backend Environment Variables (Render)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | ✅ Yes | `your-super-secret-key-here` |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes | `AIzaSy...` |
| `CLOUDINARY_URL` | Cloudinary connection URL | ⚠️ Optional* | `cloudinary://key:secret@cloudname` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ⚠️ Optional* | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ⚠️ Optional* | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ⚠️ Optional* | `your-api-secret` |
| `NODE_ENV` | Node environment | ✅ Yes | `production` |
| `PORT` | Server port | ❌ No | `10000` (auto-set by Render) |

*Cloudinary: Use either `CLOUDINARY_URL` OR the three individual variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)

### Frontend Environment Variables (Vercel)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | ✅ Yes | `https://your-backend.onrender.com/api` |

---

## Docker Deployment (Optional)

### Build Docker Image
```bash
docker build -t creatorflow-backend .
```

### Run Docker Container
```bash
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e GEMINI_API_KEY="your-gemini-key" \
  -e CLOUDINARY_URL="your-cloudinary-url" \
  -e NODE_ENV="production" \
  --name creatorflow-backend \
  creatorflow-backend
```

### Using Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CLOUDINARY_URL=${CLOUDINARY_URL}
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## Post-Deployment Checklist

### Backend
- [ ] Verify backend is accessible: `https://your-backend.onrender.com`
- [ ] Test health endpoint: `https://your-backend.onrender.com/`
- [ ] Verify MongoDB connection in logs
- [ ] Test authentication endpoints
- [ ] Verify CORS is configured correctly

### Frontend
- [ ] Verify frontend is accessible: `https://your-frontend.vercel.app`
- [ ] Test login/register functionality
- [ ] Verify API calls are working (check browser console)
- [ ] Test all major features

### Security
- [ ] Ensure all environment variables are set
- [ ] Verify JWT_SECRET is strong (32+ characters)
- [ ] Check that sensitive data is not exposed in client-side code
- [ ] Enable HTTPS (automatic on Render and Vercel)

---

## Troubleshooting

### Backend Issues

**Build fails on Render:**
- Check that `package.json` has correct scripts
- Verify Node.js version compatibility
- Check build logs for specific errors

**MongoDB connection fails:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- Verify database user has correct permissions

**CORS errors:**
- Update CORS settings in `server.js` to include your frontend URL
- Check that credentials are properly configured

### Frontend Issues

**API calls fail:**
- Verify `VITE_API_URL` is set correctly in Vercel
- Check browser console for CORS errors
- Verify backend is running and accessible

**Build fails on Vercel:**
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Check that `vite.config.js` is configured correctly

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Cloudinary Setup](https://cloudinary.com/documentation)

---

## Support

For issues or questions:
1. Check the logs in Render/Vercel dashboards
2. Review environment variables configuration
3. Test endpoints using Postman or curl
4. Check browser console for frontend errors






