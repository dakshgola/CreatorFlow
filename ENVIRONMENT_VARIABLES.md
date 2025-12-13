# Environment Variables Registry

Complete registry of all environment variables used in the CreatorFlow application.

---

## Backend Environment Variables

### Required Variables

#### `MONGODB_URI`
- **Description**: MongoDB database connection string
- **Type**: String (URI)
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Required**: ✅ Yes
- **Example**: 
  ```
  mongodb+srv://admin:password123@cluster0.abc123.mongodb.net/creatorflow?retryWrites=true&w=majority
  ```
- **Where to get**: MongoDB Atlas → Connect → Connection String
- **Used in**: `config/db.js`

#### `JWT_SECRET`
- **Description**: Secret key for signing and verifying JWT tokens
- **Type**: String
- **Min Length**: 32 characters (recommended)
- **Required**: ✅ Yes
- **Example**: 
  ```
  your-super-secret-jwt-key-minimum-32-characters-long
  ```
- **Security**: Use a strong, random string. Never commit to version control.
- **Used in**: `controllers/authController.js`, `middleware/authMiddleware.js`

#### `GEMINI_API_KEY`
- **Description**: Google Gemini API key for AI features
- **Type**: String
- **Required**: ✅ Yes (for AI features)
- **Example**: 
  ```
  AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
  ```
- **Where to get**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Used in**: `utils/geminiClient.js`

### Optional Variables

#### `CLOUDINARY_URL` (Option 1 - Recommended)
- **Description**: Complete Cloudinary connection URL
- **Type**: String (URI)
- **Format**: `cloudinary://api_key:api_secret@cloud_name`
- **Required**: ⚠️ Optional (if using Cloudinary for media uploads)
- **Example**: 
  ```
  cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@my-cloud-name
  ```
- **Where to get**: Cloudinary Dashboard → Settings → Product Environment Credentials
- **Used in**: `config/utils/cloudinary.js`
- **Note**: Use this OR the three individual variables below

#### `CLOUDINARY_CLOUD_NAME` (Option 2 - Alternative)
- **Description**: Cloudinary cloud name
- **Type**: String
- **Required**: ⚠️ Optional (if not using `CLOUDINARY_URL`)
- **Example**: `my-cloud-name`
- **Used in**: `config/utils/cloudinary.js`

#### `CLOUDINARY_API_KEY` (Option 2 - Alternative)
- **Description**: Cloudinary API key
- **Type**: String
- **Required**: ⚠️ Optional (if not using `CLOUDINARY_URL`)
- **Example**: `123456789012345`
- **Used in**: `config/utils/cloudinary.js`

#### `CLOUDINARY_API_SECRET` (Option 2 - Alternative)
- **Description**: Cloudinary API secret
- **Type**: String
- **Required**: ⚠️ Optional (if not using `CLOUDINARY_URL`)
- **Example**: `abcdefghijklmnopqrstuvwxyz123456`
- **Used in**: `config/utils/cloudinary.js`

#### `PORT`
- **Description**: Port number for the server to listen on
- **Type**: Number
- **Default**: `5000`
- **Required**: ❌ No (auto-set by hosting platforms)
- **Example**: `5000`, `10000`
- **Used in**: `server.js`
- **Note**: Render and other platforms usually set this automatically

#### `NODE_ENV`
- **Description**: Node.js environment mode
- **Type**: String
- **Values**: `development` | `production` | `test`
- **Default**: `development`
- **Required**: ✅ Yes (for production)
- **Example**: `production`
- **Used in**: Multiple files for error handling and feature flags

---

## Frontend Environment Variables

### Required Variables

#### `VITE_API_URL`
- **Description**: Base URL for the backend API
- **Type**: String (URL)
- **Required**: ✅ Yes (for production)
- **Example (Development)**: 
  ```
  http://localhost:5000/api
  ```
- **Example (Production)**: 
  ```
  https://your-backend-service.onrender.com/api
  ```
- **Used in**: `src/hooks/useApi.js`
- **Note**: Vite requires `VITE_` prefix for client-side environment variables

---

## Environment Setup by Platform

### Local Development

Create a `.env` file in the root directory:

```env
# Backend (.env in root)
MONGODB_URI=mongodb://localhost:27017/creatorflow
JWT_SECRET=your-local-development-secret-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_URL=cloudinary://key:secret@cloudname
NODE_ENV=development
PORT=5000
```

```env
# Frontend (.env in root, for Vite)
VITE_API_URL=http://localhost:5000/api
```

### Render (Backend)

Set in Render Dashboard → Environment:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=production-secret-key-min-32-chars
GEMINI_API_KEY=your-production-gemini-key
CLOUDINARY_URL=cloudinary://key:secret@cloudname
NODE_ENV=production
```

### Vercel (Frontend)

Set in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong secrets**: JWT_SECRET should be at least 32 characters, randomly generated
3. **Rotate secrets regularly**: Especially if compromised
4. **Use different secrets** for development and production
5. **Restrict MongoDB access**: Use IP whitelisting in MongoDB Atlas
6. **Monitor API usage**: Set up alerts for unusual activity
7. **Use environment-specific values**: Never use production secrets in development

---

## Generating Secure Secrets

### JWT_SECRET
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using online generator
# Visit: https://randomkeygen.com/
```

### MongoDB URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Render)
5. Get connection string from "Connect" → "Connect your application"

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

### Cloudinary Credentials
1. Sign up at [Cloudinary](https://cloudinary.com) (free tier available)
2. Go to Dashboard → Settings
3. Copy the "Cloudinary URL" or individual credentials

---

## Validation Checklist

Before deploying, verify:

- [ ] All required backend variables are set
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `MONGODB_URI` is valid and accessible
- [ ] `GEMINI_API_KEY` is valid (test with a simple API call)
- [ ] `CLOUDINARY_URL` or individual credentials are set (if using media uploads)
- [ ] `VITE_API_URL` points to the correct backend URL
- [ ] `NODE_ENV` is set to `production` in production
- [ ] No secrets are exposed in client-side code
- [ ] `.env` files are in `.gitignore`

---

## Troubleshooting

### "MongoDB connection failed"
- Check `MONGODB_URI` format
- Verify IP whitelist in MongoDB Atlas
- Check database user credentials

### "JWT verification failed"
- Verify `JWT_SECRET` matches between token creation and verification
- Check that secret is not empty
- Ensure secret hasn't changed since tokens were issued

### "Gemini API error"
- Verify `GEMINI_API_KEY` is correct
- Check API quota/limits
- Verify internet connectivity

### "Cloudinary upload failed"
- Check `CLOUDINARY_URL` format
- Verify credentials are correct
- Check Cloudinary account status

### "API calls fail from frontend"
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration in backend
- Verify backend is accessible from frontend domain

---

## Quick Reference

| Variable | Backend | Frontend | Required |
|----------|---------|----------|----------|
| `MONGODB_URI` | ✅ | ❌ | ✅ |
| `JWT_SECRET` | ✅ | ❌ | ✅ |
| `GEMINI_API_KEY` | ✅ | ❌ | ✅ |
| `CLOUDINARY_URL` | ✅ | ❌ | ⚠️ |
| `NODE_ENV` | ✅ | ❌ | ✅ |
| `PORT` | ✅ | ❌ | ❌ |
| `VITE_API_URL` | ❌ | ✅ | ✅ |

---

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md)






