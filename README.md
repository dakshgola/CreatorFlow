# CreatorFlow

> An intelligent, full-stack content management and analytics dashboard designed specifically for digital creators. 

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](#)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](#)

[**Live Demo**](https://creator-flow-livid.vercel.app/) • [**API Documentation**](#api-endpoints) • [**Architecture**](#architecture)

---

## What Makes This Different
Many portfolio dashboards use mocked data and insecure authentication practices. CreatorFlow was built with production-grade engineering principles in mind:
- **Real Aggregation Pipelines**: Analytics are not hardcoded. The dashboard queries MongoDB using complex aggregation pipelines to generate real-time metrics.
- **Secure Authentication**: Transitions away from the standard (and vulnerable) `localStorage` JWT pattern, utilizing strict `httpOnly` cookies to mitigate XSS attacks.
- **Zero-Dependency Implementations**: Core interactive features, such as the Kanban board, were built using native browser APIs (HTML5 Drag and Drop) rather than relying on heavy third-party libraries.
- **Integrated Generative AI**: Utilizes the Google Gemini API to actually generate usable content ideas, captions, and performance scores, persisting the results to the database for historical tracking.

## Core Features

### 🔐 Secure Authentication & User Management
Full JWT-based authentication system utilizing secure, `httpOnly`, and `SameSite=Strict` cookies. Includes user registration, login, session persistence, and secure logout mechanisms.

### 🤖 Generative AI Suite
Integration with Google's `gemini-1.5-flash` model. Features a Content Idea Generator, Caption Writer, and Content Performance Scorer. All AI outputs are saved to the database with bookmarking and deletion capabilities.

### 📊 Real-Time Analytics Dashboard
A comprehensive data visualization suite built with Recharts, driven by real MongoDB aggregation queries calculating historical trends, content performance, and platform metrics.

### 📋 Drag-and-Drop Content Planner
A custom-built Kanban board using native HTML5 Drag and Drop APIs. Allows creators to seamlessly move content ideas through a pipeline (Idea → Script → Shoot → Edit → Posted) with optimistic UI updates.

### 💼 Agency Operations 
Complete interfaces for client management, task tracking, and payment processing, tailored for freelance creators scaling into agencies.

## Architecture

```text
[ Client / Browser ]
        │
        ▼ (HTTPS / REST API)
        │
[ Vercel Frontend ] ── (React / Vite / Tailwind)
        │
        ▼ (Cookies / JSON)
        │
[ Render Backend ] ── (Node.js / Express / Mongoose)
        │
   ┌────┴────┐
   ▼         ▼
[ MongoDB ] [ Google Gemini API ]
(Database)  (LLM processing)
```

## Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), React Router DOM | Core UI and SPA routing |
| **Styling** | Tailwind CSS, Recharts | Utility-first styling and data visualization |
| **Backend** | Node.js, Express.js | REST API and server logic |
| **Database** | MongoDB, Mongoose | NoSQL data persistence and ORM |
| **Authentication**| JWT, Cookie-Parser | Stateless, cookie-based session management |
| **AI / LLM** | Google Gemini API | Content generation and analysis |
| **Deployment** | Vercel, Render | Edge hosting and continuous integration |

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Google Gemini API Key

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/creatorflow.git
   cd creatorflow
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the `/backend` directory.

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/creatorflow

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# AI Integration
GEMINI_API_KEY=your_google_gemini_api_key

# CORS
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| **POST** | `/api/v1/auth/register` | No | Register a new user |
| **POST** | `/api/v1/auth/login` | No | Authenticate user and issue `httpOnly` cookie |
| **POST** | `/api/v1/auth/logout` | Yes | Clear authentication cookies |
| **GET** | `/api/v1/auth/me` | Yes | Retrieve current authenticated user profile |
| **GET** | `/api/v1/planner` | Yes | Retrieve all Kanban cards, grouped by status |
| **POST** | `/api/v1/planner` | Yes | Create a new content card |
| **PATCH**| `/api/v1/planner/:id` | Yes | Update card status (trigger drag-and-drop move) |
| **DELETE**| `/api/v1/planner/:id` | Yes | Remove a card from the board |
| **POST** | `/api/v1/ai/generate` | Yes | Dispatch prompt to Gemini API and save response |

## Screenshots

*(Insert screenshots of the dashboard, Kanban board, and AI tools here)*

* Dashboard View: `[Screenshot 1]`
* Kanban Content Planner: `[Screenshot 2]`
* AI Generation Suite: `[Screenshot 3]`

## Engineering Decisions & Learnings

Building CreatorFlow required making specific architectural choices to ensure performance, security, and maintainability.

### 1. Security: `httpOnly` Cookies over `localStorage`
Initially, the project utilized standard JWT authentication by storing tokens in the browser's `localStorage`. However, `localStorage` is accessible via JavaScript, leaving the application vulnerable to Cross-Site Scripting (XSS) attacks. I refactored the entire authentication flow to attach JWTs to strict, `httpOnly` secure cookies. This ensures tokens are automatically sent with API requests but remain completely inaccessible to client-side scripts, significantly improving the security posture of the app.

### 2. UI Engineering: HTML5 Drag & Drop vs. Third-Party Libraries
For the Kanban board, it is standard practice to reach for libraries like `react-beautiful-dnd` or `@dnd-kit`. I chose to build the drag-and-drop system from scratch using the native HTML5 Drag and Drop API. This decision removed a heavy dependency, reduced the bundle size, and gave me a deep understanding of browser event lifecycles (`onDragStart`, `onDragOver`, `onDrop`), `dataTransfer` objects, and managing optimistic UI state updates in React.

### 3. AI Integration: Google Gemini Flash over OpenAI GPT
While GPT-3.5/4 is the default choice for many AI wrappers, I opted for Google's `gemini-1.5-flash`. The Flash model provides an excellent balance of high inference speed and cost-effectiveness, which is critical for a dashboard where users expect instantaneous feedback for content ideas and caption generation. The official `@google/generative-ai` SDK was lightweight and straightforward to integrate into my Express controllers.
