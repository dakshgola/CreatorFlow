# Quick Deployment Guide

Quick reference for deploying CreatorFlow.

## 🚀 Backend to Render (5 minutes)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Settings:
     - **Name**: `creatorflow-backend`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

3. **Add Environment Variables** (in Render dashboard):
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
   JWT_SECRET=your-32-char-secret-key-here
   GEMINI_API_KEY=your-gemini-key
   CLOUDINARY_URL=cloudinary://key:secret@cloudname
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Deploy** → Wait 2-5 minutes → Copy backend URL

---

## 🎨 Frontend to Vercel (3 minutes)

1. **Update API URL** (already done in `useApi.js`)

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import GitHub repo
   - Settings:
     - **Framework**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy** → Copy frontend URL

5. **Update Backend CORS**:
   - In Render, add/update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
   - Redeploy backend

---

## ✅ Verify Deployment

**Backend:**
- Visit: `https://your-backend.onrender.com/`
- Should see: `{"ok":true,"message":"Creator Flow API is running!"}`

**Frontend:**
- Visit: `https://your-frontend.vercel.app`
- Try login/register
- Check browser console for errors

---

## 📋 Environment Variables Checklist

### Backend (Render)
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET` (32+ chars)
- [ ] `GEMINI_API_KEY`
- [ ] `CLOUDINARY_URL` (optional)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` (your Vercel URL)

### Frontend (Vercel)
- [ ] `VITE_API_URL` (your Render backend URL + `/api`)

---

## 🔧 Troubleshooting

**Backend won't start:**
- Check Render logs
- Verify all env vars are set
- Check MongoDB connection

**Frontend can't connect:**
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

**CORS errors:**
- Add frontend URL to `FRONTEND_URL` in Render
- Redeploy backend

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)





