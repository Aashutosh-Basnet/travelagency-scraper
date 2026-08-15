# Full-Stack Blog Platform ("Editorial") — Code & Architecture Guide

A complete technical breakdown explaining the architecture, backend Express APIs, MongoDB session authentication, Multer uploads, and the React + Vite frontend.

---

## 1. System Architecture & High-Level Flow

```
[Browser / Client (Port 5173)]
        │
        │ HTTP (Credentials: include, connect.sid session cookie)
        ▼
[Vite Dev Proxy (Port 5173)] ─── Relays /api & /uploads ───► [Express Backend (Port 5000)]
                                                                  │
                                            ┌─────────────────────┴─────────────────────┐
                                            ▼                                           ▼
                                 [MongoDB Database]                             [Uploads Directory]
                                 • users collection                             • Cover image files
                                 • posts collection
                                 • sessions collection (connect-mongo)
```

---

## 2. Backend Breakdown (`/server`)

### `server.js` — Server Core & Middleware Pipeline
1. **`connectDB()`**: Initializes the Mongoose connection to MongoDB.
2. **`app.set('trust proxy', 1)`**: Configures Express to trust proxy headers from Vite, ngrok, or reverse proxies so HTTPS session cookies work correctly.
3. **`cors()`**: Configured with dynamic origin resolution to accept `localhost`, `127.0.0.1`, and any `*.ngrok-free.app` / `*.loca.lt` domains with `credentials: true`.
4. **`session()` with `connect-mongo`**:
   - Manages sessions using MongoDB as the storage engine (`MongoStore.create()`).
   - Generates a signed `connect.sid` cookie sent to the browser.
   - Configured with `httpOnly: true` (prevents JavaScript access / XSS attacks) and `sameSite: 'lax'`.
5. **Static File Serving**: `app.use('/uploads', express.static(...))` serves cover photos uploaded via Multer.
6. **Routes**: Mounts `/api/auth` and `/api/posts`.

---

### `models/User.js` & `models/Post.js` — Database Schemas
- **`User`**:
  - `name`: User's full name.
  - `email`: Indexed unique string with lowercase normalization and email regex validation.
  - `passwordHash`: Salted bcrypt hash string.
- **`Post`**:
  - `title`, `content`: Required strings.
  - `author`: `ObjectId` referencing the `User` model.
  - `tags`: Array of strings for topics.
  - `coverImage`: String path to the uploaded image in `/uploads`.
  - `status`: String enum `['draft', 'published']` (defaults to `'published'`).
  - Compound indexes on `(author, createdAt)` and `(status, createdAt)` for query performance.

---

### `middleware/auth.js` & `middleware/upload.js`
- **`requireAuth`**:
  - Inspects `req.session.userId`.
  - If missing, immediately halts the request with `401 Unauthorized`.
  - If present, fetches the sanitized user (`-passwordHash`) and attaches it to `req.user`.
- **`upload` (Multer)**:
  - Stores files in the `uploads/` directory with unique timestamp suffixes (`cover-1786...png`).
  - Validates MIME types strictly for `jpeg`, `jpg`, `png`, `webp`, `gif`.
  - Enforces a 5MB size limit.

---

### `controllers/authController.js` — Authentication Handlers
- **`signup`**:
  - Validates inputs (name, email format, minimum 6 characters for password).
  - Checks if the email is already registered.
  - Hashes the password with `bcrypt.hash(password, 10)` (10 salt rounds).
  - Creates the user and sets `req.session.userId = user._id`.
  - Returns `user` (excluding `passwordHash`).
- **`login`**:
  - Finds the user by email.
  - Uses `bcrypt.compare(password, user.passwordHash)` to securely verify passwords in constant time.
  - Attaches `req.session.userId` upon success.
- **`logout`**:
  - Destroys the session document in MongoDB via `req.session.destroy()`.
  - Erases the `connect.sid` cookie from the client with `res.clearCookie('connect.sid')`.
- **`getMe`**:
  - Returns the currently logged in user based on `req.session.userId` (or 401 if unauthenticated).

---

### `controllers/postController.js` — Post CRUD & Public Feed
- **`getPublicFeed`**:
  - Queries all published posts (`{ status: 'published' }`).
  - Supports keyword search (title, content, tags) and tag filtering.
  - Populates author details (`name`, `email`).
- **`getUserPosts`**:
  - Queries only posts belonging to the authenticated user (`{ author: req.session.userId }`).
  - Supports filtering by `draft` vs `published`.
- **`createPost`**:
  - Creates a new post attached to `req.session.userId`.
  - Extracts uploaded cover image if provided by Multer.
- **`updatePost` & `deletePost`**:
  - Checks authorization: `post.author.toString() === req.session.userId.toString()`.
  - Rejects unauthorized updates with `403 Forbidden`.
  - Deletes replaced/deleted cover files from disk to prevent storage leaks.

---

## 3. Frontend Breakdown (`/client`)

### State & Context Architecture
1. **`ThemeContext.jsx`**:
   - Manages Dark vs Light mode with `localStorage` persistence.
   - Adds/removes the `.dark` class on `<html>`.
2. **`ToastContext.jsx`**:
   - Provides global notifications (`toast.success()`, `toast.error()`, `toast.info()`) with auto-dismiss timers.
3. **`AuthContext.jsx`**:
   - Calls `GET /api/auth/me` on application boot.
   - Provides `user`, `login()`, `signup()`, `logout()`, and `loading` state to the entire app.
4. **`ProtectedRoute.jsx`**:
   - Wraps dashboard and editor routes. If `!user`, redirects unauthenticated users to `/login`.

---

### Page Components & Features
1. **`FeedPage.jsx`**:
   - Dynamic Hero section with ambient glowing mesh.
   - Featured article spotlight showcase banner.
   - Category pill filters with active glowing states.
   - Responsive multi-column story grid using `PostCard.jsx`.
   - Shimmering skeleton loaders (`SkeletonCard.jsx`) during async data fetching.
   - Interactive newsletter subscription banner (`NewsletterBanner.jsx`).
2. **`PostDetailPage.jsx`**:
   - Floating scroll-progress bar (`ReadingProgressBar.jsx`) pinned to the top.
   - Dynamic Table of Contents (`TableOfContents.jsx`) parsing markdown headers and tracking scroll position.
   - Interactive Medium-style applause button (`ClapButton.jsx`) with floating particle animations.
   - Author showcase card and direct link copy trigger.
3. **`DashboardPage.jsx`**:
   - Writer analytics cards (Total Stories, Published, Drafts, Total Words).
   - Real-time search and sorting dropdown (`Newest`, `Oldest`, `Title A-Z`).
   - Glassmorphic stories table with actions (`View`, `Edit`, `Delete` with `ConfirmModal.jsx`).
4. **`PostEditorPage.jsx`**:
   - Dual-pane workspace with live markdown glass preview.
   - Markdown formatting insertion toolbar (`H2`, `Bold`, `Italic`, `Quotes`, `Code`).
   - Drag & drop cover image uploader with preview and remove controls.
   - Tag suggestion chips (`+technology`, `+react`, `+design`, etc.).
5. **`LoginPage.jsx` & `SignupPage.jsx`**:
   - Dark glassmorphic authentication cards.
   - Password visibility toggle (`Eye` / `EyeOff`).
   - 1-click Demo credentials auto-fill button.

---

## 4. How to Export this Guide as a PDF

1. Open the file **`CODE_EXPLANATION_GUIDE.html`** in Google Chrome or Microsoft Edge:
   - Double-click `C:\Users\Acer\.gemini\antigravity\scratch\blog-website\CODE_EXPLANATION_GUIDE.html`
2. Click the **"🖨️ Print / Save as PDF"** button at the top (or press `Ctrl + P`).
3. Select **"Save as PDF"** as the destination and click **Save**!
