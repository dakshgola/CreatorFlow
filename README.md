# CreatorFlow

An intelligent, full-stack content management dashboard designed for digital creators to generate, score, organize, and analyze their multi-platform content.

---

## Live Demo & Wake-Up Note

* **Live Demo URL**: [https://creator-flow-livid.vercel.app/](https://creator-flow-livid.vercel.app/)
* **Note on Render Free Tier**: The backend is hosted on Render's free tier. If the application has been idle, the initial page load or login check may take 15 to 30 seconds to wake up the backend server container.

---

## Screenshots

* **Creator Analytics Dashboard**
  ![Dashboard View](/screenshots/dashboard.png)

* **Kanban Content Planner**
  ![Kanban Content Planner](/screenshots/kanban.png)

* **AI Generation Suite**
  ![AI Generation Suite](/screenshots/ai_tools.png)

* **Saved Content History**
  ![Saved Content History](/screenshots/analytics.png)

---

## Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), React Router DOM, Tailwind CSS, TypeScript (partial) | Single Page Application framework, routing, styling, and typed utility hooks |
| **Backend** | Node.js, Express.js | REST API server |
| **Database** | MongoDB, Mongoose | NoSQL persistence and data schemas |
| **AI / LLM** | Google Gemini API (`gemini-2.5-flash`) | Content generation, scoring, chat context, and weekly digests |
| **Testing** | Vitest, Supertest | Unit and endpoint integration testing suite |
| **Media Store** | Multer, Cloudinary | Buffer-based file uploading and CDN hosting |
| **Deployment** | Vercel (Frontend), Render (Backend) | Multi-cloud hosting architecture |

---

## Implemented Features (Currently Working)

### 1. Secure Cookie-Based Authentication
* **Strict Cookie Security**: The system uses `httpOnly` secure cookies to store access and refresh tokens, mitigating Cross-Site Scripting (XSS) attacks. Access tokens expire in 15 minutes, and refresh tokens expire in 7 days (and are tracked in the database).
* **Endpoints**: Supported flows include `/register` (POST), `/login` (POST), `/logout` (POST/DELETE), `/refresh` (POST), and `/me` (GET/PUT).

### 2. Kanban Board Content Planner
* **Native Drag & Drop**: Uses browser-native HTML5 Drag and Drop events (`onDragStart`, `onDragOver`, `onDrop`) for custom planner board manipulation.
* **Optimistic Updates & Local Rollback**: Moves cards instantly on the client side, then syncs state to the database via PATCH. If the server or network request fails, the client board immediately rolls back to its exact pre-drag state and raises a Toast notification.
* **Columns**: Planner cards move through `Idea` → `Script` → `Shoot` → `Edit` → `Posted` states.

### 3. Integrated Google Gemini Generative Suite
* **Content Generator (`/ai/generate`)**: Accepts `topic` and `platform` inputs, fetches the creator's saved profile context, and generates content.
* **Granular Generator Tabs**: Dedicated tabs on the AI Tools page make direct API calls to:
  - `POST /api/v1/ai/ideas`: Generates content ideas based on niche and prompt parameters.
  - `POST /api/v1/ai/captions`: Generates caption variations for social networks.
  - `POST /api/v1/ai/scripts`: Generates ready-to-shoot short-form video scripts.
  - `POST /api/v1/ai/hooks`: Generates scroll-stopping hook ideas.
* **A/B Title Tester (`/ai/ab-titles`)**: Generates 5 click-worthy titles for a topic based on winning past title history, saving the selected winner.
* **Multi-Platform Pipeline (`/ai/pipeline`)**: Takes a script and generates parallel copy for Reels, LinkedIn, Twitter threads, and Email newsletters.
* **Content Scorer (`/ai/score`)**: Scores scripts out of 10 across hook strength, clarity, and retention, offering automated fix suggestions.
* **Reddit Ingest Hook Generator (`/ai/trending-hooks`)**: Scrapes top posts from a niche subreddit, caches them in-memory, and generates hooks from those discussions.
* **AI Chat Assistant (`/api/v1/ai/chat`)**: Context-aware multi-turn creative partner. Retrieves the last 10 messages from the database as chat history to maintain conversational context.
* **AI Weekly Digest (`/api/v1/ai/digest`)**: Generates a weekly briefing modal on the dashboard summarizing recent planner cards and content history.
* **Star Bookmarking (`/api/v1/ai/:id`)**: PATCH endpoint allows bookmarking/saving individual items from both the output view and the recent generations panel.

### 4. Background Creator Analytics
* **Daily Ingestion**: Background script simulates YouTube views, subscriber increases, and watch hours, triggering a Gemini evaluation to upsert a dynamic "Daily Creator Insight" into the database.
* **Recharts Dashboard**: Displays view and subscriber trends over the last 30 days and renders the dynamic AI briefing.

---

## Partial & Client-Side Mock Features

* **Brand CRM, Tasks & Payments Pages**: The Mongoose models (`Client.js`, `Project.js`, `Task.js`, `Payment.js`) and REST controllers exist on the backend, but the frontend pages (`Clients.jsx`, `Tasks.jsx`, `Payments.jsx`) are currently operated as mock clients using local React state.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 1. Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `/backend` using the variables below:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/creatorflow
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   GEMINI_API_KEY=your_google_gemini_api_key
   # Cloudinary config (optional, required for media upload page)
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
5. Run the test suite:
   ```bash
   npm test
   ```

### 2. Set Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to the local URL (defaults to `http://localhost:5173`).

---

## API Endpoints Table

All routes are versioned and require authentication (verified via `jwt` cookie) unless stated otherwise.

| Method | Route | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| **POST** | `/api/v1/auth/register` | No | Creates a new user account, issues JWT cookies |
| **POST** | `/api/v1/auth/login` | No | Authenticates user, returns user profile, sets JWT cookies |
| **POST/DELETE** | `/api/v1/auth/logout` | Yes | Unsets access/refresh cookies, revokes DB refresh token |
| **GET** | `/api/v1/auth/me` | Yes | Returns authenticated user profile |
| **GET** | `/api/v1/planner` | Yes | Gets all planner cards, grouped by column status |
| **POST** | `/api/v1/planner` | Yes | Creates a new planner card |
| **PATCH** | `/api/v1/planner/:id` | Yes | Updates card fields (used for drag-and-drop column move) |
| **DELETE** | `/api/v1/planner/:id` | Yes | Deletes planner card |
| **POST** | `/api/v1/ai/generate` | Yes | Runs prompt through Gemini model, saves to content history |
| **GET** | `/api/v1/ai/generate` | Yes | Fetches the last 5 generations |
| **POST** | `/api/v1/ai/ideas` | Yes | Generates a list of content ideas |
| **POST** | `/api/v1/ai/captions` | Yes | Generates caption variations |
| **POST** | `/api/v1/ai/scripts` | Yes | Generates a short-form video script |
| **POST** | `/api/v1/ai/hooks` | Yes | Generates viral hooks |
| **POST** | `/api/v1/ai/chat` | Yes | Context-aware multi-turn conversational creative partner |
| **PATCH** | `/api/v1/ai/:id` | Yes | Updates bookmark status of an AI generation |
| **GET** | `/api/v1/ai/digest` | Yes | Generates weekly digest from planner cards and history |
| **POST** | `/api/v1/ai/ab-titles` | Yes | Generates 5 title variations based on winning titles |
| **POST** | `/api/v1/ai/ab-titles/:sessionId/choose` | Yes | Chooses the winning title in A/B test |
| **POST** | `/api/v1/ai/pipeline` | Yes | Transforms a single script into Reels, LinkedIn, Twitter, and newsletter formats |
| **POST** | `/api/v1/ai/score` | Yes | Scores text out of 10, returns retention analysis |
| **GET** | `/api/v1/ai/trending-hooks` | Yes | Fetches current Reddit trends in niche and creates hooks |
| **GET** | `/api/v1/creator-analytics` | Yes | Retrieves daily views/subscriber stats and AI insights |
| **POST** | `/api/v1/creator-analytics/sync` | Yes | Manually triggers the mock YouTube analytics ingestion |
| **GET** | `/api/v1/history` | Yes | Fetches content scoring/generation history (last 20 items) |
| **GET** | `/api/v1/history/saved` | Yes | Fetches bookmarked content items |
| **PATCH** | `/api/v1/history/:id/save` | Yes | Toggles bookmark status of a content history item |
| **DELETE** | `/api/v1/history/:id` | Yes | Deletes content history item |
| **GET** | `/api/v1/clients` | Yes | Retrieves brand client CRM list (not consumed by frontend) |
| **POST** | `/api/v1/clients` | Yes | Creates brand client (not consumed by frontend) |
| **PUT** | `/api/v1/clients/:id` | Yes | Updates brand client (not consumed by frontend) |
| **DELETE** | `/api/v1/clients/:id` | Yes | Deletes brand client (not consumed by frontend) |
| **GET** | `/api/v1/projects` | Yes | Retrieves user project campaigns |
| **POST** | `/api/v1/projects` | Yes | Creates user project campaign |
| **PUT** | `/api/v1/projects/:id` | Yes | Updates user project campaign |
| **DELETE** | `/api/v1/projects/:id` | Yes | Deletes user project campaign |
| **GET** | `/api/v1/media` | Yes | Retrieves user uploaded media list |
| **POST** | `/api/v1/media/upload` | Yes | Uploads image to Cloudinary (binary buffer form data) |
| **DELETE** | `/api/v1/media/:id` | Yes | Deletes media from Cloudinary and database |

---

## Engineering Decisions

### 1. HTTPOnly Cookie-Based Auth Over LocalStorage JWT
Portfolio apps often store JWTs in local storage because it is simple to implement. However, this exposes tokens to Cross-Site Scripting (XSS) scripts. We structured the authentication pipeline to set secure cookies (`token`) containing a JWT signed with `JWT_SECRET`. These are configured as `httpOnly`, `sameSite: 'strict'`, and `secure` (in production). Since the browser attaches cookies automatically, client-side code does not need access to the token string, eliminating token extraction vectors.

### 2. Native HTML5 Drag and Drop Over Heavy Libraries
To build the Kanban board, we used browser-native Drag and Drop events (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) instead of adding heavy libraries like `react-beautiful-dnd` or `@dnd-kit`. This keeps the client bundle lightweight and gives complete control over react re-rendering cycles. State is updated optimistically on drop, backed up by deep cloning the planner state object, and rolled back locally to the pre-drag coordinates if the server API PATCH fails.

### 3. Gemini 2.5 Flash Over OpenAI GPT Models
We selected Google's `gemini-2.5-flash` model for generative text capabilities. The Flash model has high inference speeds, low latency, and is cost-competitive. Crucially, the Gemini SDK has native support for structured JSON returns via `responseMimeType: "application/json"`, which allows clean, validation-safe generation of arrays (like A/B titles and hooks) and structured content packages without brittle string regex manipulation.

### 4. Gradual TypeScript Integration
To establish codebase scalability, we set up TypeScript compilation via a root `tsconfig.json` in the frontend and migrated key utility hooks (`useDarkMode` and `useApi`) to `.ts` coordinates. By declaring strict type contracts for generic API request/response structures, we ensure frontend state updates are fully typed while leaving layouts to be migrated progressively.

### 5. Automated Endpoint Testing with Vitest
Instead of verifying routing logic manually with Postman, we installed Vitest and Supertest in the backend. We mocked out structural modules (database connection pings, Google Generative AI, Sentry logging) and wrote integration tests mapping validation rules (such as validating niche strings or password lengths) and authentication states.

---

## Known Limitations & Roadmap

* **Partial TypeScript Coverage**: Only critical state management hooks (`useApi.ts`, `useDarkMode.ts`) are fully typed. Page layouts and contexts are currently plain JavaScript and will be converted systematically.
* **Render Free Tier Cold Start**: Because the backend container is spun down after inactivity, the first request will take roughly 15 seconds to wake up the server. A frontend loader has been implemented to handle this UX gracefully.
* **Mock Brand CRM Pages**: The Brand CRM (`/clients`), Tasks, and Payments page structures on the frontend operate in local React state and are not yet connected to their backend models.
