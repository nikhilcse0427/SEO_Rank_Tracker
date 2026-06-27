# SEO Rank Tracker

A full-stack SEO analysis and keyword rank tracking application. Analyze any website with AI-powered audits, track keyword positions over time, and get actionable recommendations to improve search rankings.

**Live repo:** [github.com/nikhilcse0427/SEO_Rank_Tracker](https://github.com/nikhilcse0427/SEO_Rank_Tracker)

---

## Features

- **AI SEO Audits** — Enter a URL and receive a detailed report with overall and category scores (SEO, performance, accessibility, best practices).
- **Real Browser Scraping** — Uses BrowserBase and Playwright to render pages like a real user, capturing accurate meta data, headings, links, and images.
- **Mistral AI Analysis** — AI reviews scraped data and returns prioritized issues with recommendations.
- **Keyword Rank Tracking** — Add keywords and domains to monitor Google search positions, history, and competitors.
- **Automated Daily Checks** — A cron job runs rank tracking every day at 6:00 AM for all active keywords.
- **User Authentication** — Register, log in, and manage your own analyses and tracked keywords via JWT.
- **Dashboard & History** — View past analyses, reports, and rank trends in a modern React UI.

---

## Tech Stack

| Layer    | Technologies |
|----------|--------------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Axios |
| Backend  | Node.js, Express 5, Mongoose |
| Database | MongoDB (Atlas or local) |
| AI       | Mistral AI |
| Scraping | BrowserBase, Playwright, Cheerio |
| Auth     | JWT, bcrypt |

---

## Project Structure

```
SEO_rank_tracker/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # Auth & theme context
│   │   └── pages/          # Home, Dashboard, Analyze, Rank Tracker, etc.
│   └── package.json
├── server/                 # Express API
│   ├── config/             # Database connection
│   ├── controllers/        # Route handlers
│   ├── cron/               # Scheduled rank tracking
│   ├── middleware/         # JWT auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── services/           # Scraping, AI, rank tracking logic
│   └── server.js
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) — local install or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- API keys:
  - [Mistral AI](https://mistral.ai/) — for SEO analysis
  - [BrowserBase](https://www.browserbase.com/) — for browser-based scraping

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nikhilcse0427/SEO_Rank_Tracker.git
cd SEO_Rank_Tracker
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your values:

```env
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://127.0.0.1:27017/rankpilot
BROWSERBASE_API_KEY=your_browserbase_key
MISTRAL_API_KEY=your_mistral_api_key
```

For production, use a MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/seo?retryWrites=true&w=majority
```

Start the API server:

```bash
npm run server   # development (nodemon)
# or
npm start        # production
```

The server runs on **http://localhost:5000** by default.

### 3. Frontend setup

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The app runs on **http://localhost:5173** by default.

Optional: create `client/.env` if your API is not on localhost:

```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint    | Description        | Auth |
|--------|-------------|--------------------|------|
| POST   | `/register` | Create account     | No   |
| POST   | `/login`    | Log in             | No   |
| GET    | `/user`     | Get current user   | Yes  |

### Analysis (`/api/analysis`)

| Method | Endpoint     | Description              | Auth |
|--------|--------------|--------------------------|------|
| POST   | `/analyze`   | Analyze a URL            | Yes  |
| GET    | `/list`      | List user analyses       | Yes  |
| GET    | `/:id`       | Get analysis by ID       | Yes  |
| DELETE | `/:id`       | Delete an analysis       | Yes  |

### Rank Tracking (`/api/rank`)

| Method | Endpoint          | Description              | Auth |
|--------|-------------------|--------------------------|------|
| POST   | `/add`            | Add keyword to track     | Yes  |
| GET    | `/list`           | List tracked keywords    | Yes  |
| GET    | `/:id`            | Get keyword details      | Yes  |
| POST   | `/:id/refresh`    | Refresh rank now         | Yes  |
| PUT    | `/:id/toggle`     | Enable/disable tracking  | Yes  |
| DELETE | `/:id`            | Remove keyword           | Yes  |

---

## How It Works

1. **Analyze** — User submits a URL. The server scrapes the page via BrowserBase, then sends structured data to Mistral AI for scoring and issue detection.
2. **Report** — Results are saved to MongoDB and displayed with score gauges, issue cards, and keyword insights.
3. **Rank Tracker** — User adds a keyword + domain. The service checks Google SERP position and stores history and competitor data.
4. **Cron** — Active keywords are re-checked daily at 6:00 AM server time.

---

## Deployment

Both `client/` and `server/` include `vercel.json` for [Vercel](https://vercel.com/) deployment.

- Set all environment variables in your hosting dashboard.
- Point `VITE_BACKEND_URL` on the frontend to your deployed API URL.
- Ensure MongoDB Atlas allows connections from your deployment IP (or use `0.0.0.0/0` for Vercel).

---

## Scripts

### Server

| Command         | Description              |
|-----------------|--------------------------|
| `npm start`     | Start production server  |
| `npm run server`| Start with nodemon (dev) |

### Client

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start Vite dev server    |
| `npm run build` | Production build         |
| `npm run preview` | Preview production build |

---

## License

ISC
