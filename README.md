# Blog Website — Full-Stack Publishing Platform

A clean, modern, and minimal editorial blog platform built with:
- **Frontend**: React 18, Vite, React Router DOM, Tailwind CSS, Lucide React icons
- **Backend**: Node.js, Express, MongoDB (Mongoose), `express-session` with `connect-mongo`, `bcrypt`, and `multer`

---

## Architecture Overview

```
blog-website/
├── server/                 # Express backend API
│   ├── config/             # MongoDB connection (Mongoose)
│   ├── controllers/        # Auth & Post controller logic
│   ├── middleware/         # Session auth protection & Multer upload
│   ├── models/             # User & Post Mongoose schemas
│   ├── routes/             # RESTful API route definitions
│   ├── uploads/            # Uploaded cover images storage
│   ├── .env                # Environment variables
│   ├── server.js           # Express app & session configuration
│   └── test_backend.js     # Automated end-to-end backend test suite
│
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # API client with credentials support
│   │   ├── components/     # Navbar, ProtectedRoute, ConfirmModal, badges, etc.
│   │   ├── context/        # AuthContext for session management
│   │   ├── pages/          # Feed, Dashboard, Editor, Detail, Login, Signup
│   │   ├── App.jsx         # App router configuration
│   │   ├── index.css       # Tailwind CSS & custom styling
│   │   └── main.jsx        # React root mount
│   ├── index.html          # HTML entry point with Inter font
│   ├── tailwind.config.js  # Clean editorial slate color palette
│   └── vite.config.js      # Vite dev proxy configuration
│
└── package.json            # Root scripts
```

---

## Features & Implementation

### 1. Authentication & Security
- Session-based authentication using `express-session` backed by MongoDB (`connect-mongo`).
- Password hashing with `bcrypt` (10 salt rounds).
- Only `userId` is stored in the session — sensitive credentials are never stored in session state.
- `requireAuth` middleware protecting user data and management actions.
- Strict authorization: Users can only view, edit, or delete their own articles from the dashboard.

### 2. Post Management & Public Feed
- **Public Feed**: Shows published articles across all authors with reading time, author metadata, tag filtering, and search.
- **Personal Dashboard**: Clean table view of the user's drafts and published articles with stats, search, and status filtering.
- **Cover Image Uploads**: Supported via `multer` with file validation, unique filenames, and static serving via `/uploads`.
- **Editor**: Supports title, content, tag chips, draft/published status toggle, and live cover image preview.
- **Delete Protection**: Modal confirmation dialog before any post deletion.

---

## Quick Start Guide

### Step 1: Start MongoDB
Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` (default port).

### Step 2: Install and Run Server
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### Step 3: Run Automated Backend Tests
In the `server` directory:
```bash
npm run test-api
```
This tests signup, login, session persistence, post creation, isolation, authorization barriers, public feed filtering, editing, and deletion.

### Step 4: Install and Run Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
The client will be accessible at `http://localhost:5173`.

---

## API Reference

### Auth Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user & initiate session | No |
| `POST` | `/api/auth/login` | Authenticate user & start session | No |
| `POST` | `/api/auth/logout` | Destroy session & clear cookie | No |
| `GET` | `/api/auth/me` | Fetch currently logged in user | Yes (Session) |

### Post Endpoints (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts/public` | Public feed of published posts (supports `search`, `tag`) | No |
| `GET` | `/api/posts/public/:id` | Get single published post | No |
| `GET` | `/api/posts` | Get all posts belonging to the logged-in user | Yes |
| `GET` | `/api/posts/:id` | Get single post belonging to the logged-in user | Yes |
| `POST` | `/api/posts` | Create new post (supports `multipart/form-data` with `coverImage`) | Yes |
| `PUT` | `/api/posts/:id` | Update user's post | Yes (Owner only) |
| `DELETE` | `/api/posts/:id` | Delete user's post | Yes (Owner only) |
