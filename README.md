# CreatorFlow

CreatorFlow is a full-stack, modern SaaS application designed specifically for digital content creators to manage their entire workflow. From AI-powered content generation and task management to client tracking and financial analytics, CreatorFlow acts as the ultimate operating system for modern creators.

## 🚀 Features

- **SaaS Dashboard**: A high-level overview of pending tasks, payments due, active clients, and engagement growth, visualized with minimal, clean Recharts.
- **AI Content Generator**: Powered by Google's Gemini API, allowing you to instantly generate viral video titles, hooks, script outlines, captions, and hashtags.
- **AI Weekly Digest**: A smart backend aggregation system that processes the last 7 days of your tasks, payments, and projects, feeding the data to Gemini to produce a professional 4-sentence business digest with priority actions.
- **Content Planner**: A Kanban-style board to track content from 'Idea' to 'Posted'.
- **Task Management**: A robust system to manage daily priorities with advanced filtering (status, priority, search).
- **Client & Payment Tracking**: Keep track of brand deals, invoices, and overdue payments.
- **Modern Minimal UI**: Handcrafted using Tailwind CSS, inspired by Linear, Vercel, and Stripe, featuring a clean `bg-gray-50` color palette, Lucide icons, and highly polished spacing and typography.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS (Minimal, custom SaaS theme)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **AI Integration**: `@google/generative-ai` (Gemini 2.5 Flash)
- **Media**: Cloudinary (Optional, for future asset management)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/creatorflow.git
cd creatorflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal tab:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

The frontend will start at `http://localhost:5173` and the backend at `http://localhost:5000`.

## 🧠 AI Features Deep Dive

### Full Content Generator (`/api/ai/generate`)
Sends a highly structured prompt to Gemini requesting specific JSON keys (`title`, `hook`, `scriptOutline`, `captions`, `hashtags`). Ensures consistent formatting for React rendering and saves the generated output to a MongoDB collection for history tracking.

### AI Weekly Digest (`/api/ai/digest`)
Aggregates cross-collection MongoDB data (Tasks, Payments, Projects) from the past 7 days. Extracts contextual metrics (e.g., overdue tasks, total pending money, most bottlenecked project stage) and securely passes this context to Gemini to synthesize a concise, actionable business summary.

## 🎨 UI/UX Design System
CreatorFlow utilizes a custom, production-grade design system:
- **Palette**: Soft neutral grays (`gray-50` backgrounds, `gray-900` text) with pure white cards.
- **Typography**: Inter font family, utilizing strict hierarchy and avoiding oversized text.
- **Interactions**: Subtle `transition-all duration-200` hover states, eliminating flashy, distracting animations in favor of calm, professional feedback.
- **Components**: Handcrafted utility classes (`.btn-primary`, `.card`, `.input`) globally defined in `index.css`.

## 🔒 Security
- Passwords are cryptographically hashed using `bcryptjs`.
- JWTs securely manage user sessions.
- Protected API routes via custom `authMiddleware`.
- Mongoose schemas sanitize inputs before database insertion.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
