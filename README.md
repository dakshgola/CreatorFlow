# CreatorFlow 🚀

**AI-Powered Content Management Platform for Indian Creators**

CreatorFlow is a comprehensive SaaS dashboard designed specifically for Indian content creators to manage their brand collaborations, content planning, AI-powered content generation, and business operations all in one place.

![CreatorFlow](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

---

## ✨ Features

### 🎯 Core Functionality
- **AI Content Generation** - Generate ideas, hooks, scripts, captions, and hashtags optimized for Indian audiences
- **Content Planner** - Plan and track your content projects with status management
- **Brand Client Management** - Manage brand collaborations, payment rates, and client information
- **Task Management** - Track tasks with priorities, due dates, and completion status
- **Payment Tracking** - Monitor payments from brand clients with due dates and payment status
- **Analytics Dashboard** - View insights on clients, tasks, payments, and projects
- **History** - Access and reuse previously generated AI content

### 🎨 UI/UX Highlights
- **Modern Dark Theme** - Beautiful dark mode interface with smooth transitions
- **Responsive Design** - Fully responsive across all devices (mobile, tablet, desktop)
- **Smooth Animations** - Subtle hover effects, transitions, and loading states
- **Consistent Design System** - Professional SaaS-grade UI with Tailwind CSS
- **Accessibility** - Semantic HTML and ARIA labels for better accessibility

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful toast notifications
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### AI Integration
- **Google Gemini AI** - Content generation API
- **Cloudinary** - Media upload and management

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/creatorflow.git
   cd creatorflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/creatorflow
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/creatorflow
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # AI Integration
   GEMINI_API_KEY=your-gemini-api-key
   
   # Media Storage (Optional)
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   # OR
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start the development server**
   ```bash
   # Start backend only
   npm run dev:server
   
   # Start frontend only (in another terminal)
   npm run dev
   
   # OR start both simultaneously
   npm run dev:all
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

---

## 📦 Production Build

### Build Frontend
```bash
npm run build
```

The built files will be in the `dist` directory.

### Start Production Server
```bash
npm start
```

### Environment Variables for Production
Make sure to set `VITE_API_URL` in your frontend build environment:
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. Deploy!

### Backend (Render/Railway/Heroku)
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables from `.env`
5. Deploy!

---

## 📁 Project Structure

```
creatorflow/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── controllers/            # Backend route controllers
├── models/                 # MongoDB Mongoose models
├── routes/                 # Express route definitions
├── middleware/             # Express middleware
├── config/                 # Configuration files
├── utils/                  # Backend utility functions
└── server.js               # Express server entry point
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/theme` - Update theme preference

### AI Tools
- `POST /api/ai/ideas` - Generate content ideas
- `POST /api/ai/hooks` - Generate video hooks
- `POST /api/ai/scripts` - Generate video scripts
- `POST /api/ai/captions` - Generate social media captions
- `POST /api/ai/hashtags` - Generate hashtags

### Content Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Analytics
- `GET /api/analytics` - Get analytics data

### History
- `GET /api/history` - Get user history

---

## 🎯 Key Features Explained

### AI Content Generation
- **Optimized for Indian Audience** - All AI-generated content is tailored for Indian social media trends
- **Multiple Content Types** - Ideas, hooks, scripts, captions, and hashtags
- **Save to Planner** - Directly save generated content to your content planner
- **History Tracking** - All generated content is saved in history for reuse

### Content Planner
- **Project Management** - Track content projects from idea to posted
- **Status Tracking** - Idea → Scripted → Shot → Edited → Posted
- **Date Planning** - Plan content with specific dates
- **Script Storage** - Store and manage content scripts

### Brand Client Management
- **Client Profiles** - Store client information, niche, and payment rates
- **Link Management** - Store client social media links
- **Notes** - Add notes about each client

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Built with ❤️ for Indian Creators

---

## 🙏 Acknowledgments

- Google Gemini AI for content generation
- Tailwind CSS for the amazing utility classes
- React team for the fantastic framework
- All the open-source contributors

---

## 📞 Support

For support, email support@creatorflow.com or open an issue in the repository.

---

**Made with ❤️ for Indian Creators 🇮🇳**
