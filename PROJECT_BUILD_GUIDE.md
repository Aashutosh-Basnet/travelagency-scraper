# Step-by-Step Project Build & Architecture Guide

This document details how to build this **Full-Stack Blog Web Application** from scratch, covering both the **Backend** (Node.js, Express, MongoDB) and **Frontend** (React, Vite, TailwindCSS, Axios).

---

## 📁 Repository Structure Overview

```text
project/
├── server/                    # Node.js + Express Backend
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies and scripts
│   ├── database/
│   │   └── db.connection.js   # MongoDB connection setup
│   ├── models/
│   │   ├── user.model.js      # Mongoose schema for Users
│   │   └── blog.model.js      # Mongoose schema for Blog Posts
│   ├── middelwares/
│   │   ├── auth.middleware.js # Session auth protection middleware
│   │   └── upload.js          # Multer file upload setup
│   ├── controllers/
│   │   ├── auth.controller.js # Auth handlers (Register, Login, Logout, Me)
│   │   ├── blog.controller.js # Blog CRUD handlers
│   │   └── user.controller.js # User profile handlers
│   ├── routes/
│   │   ├── auth.route.js      # Auth endpoint routes
│   │   ├── blog.route.js      # Blog endpoint routes
│   │   ├── user.route.js      # User endpoint routes
│   │   └── route.js           # Main router aggregator
│   └── server.js              # Server entry point & Express middleware setup
│
└── client/                    # React + Vite Frontend
    ├── package.json           # Frontend dependencies and scripts
    ├── vite.config.js         # Vite configuration
    └── src/
        ├── api/
        │   └── axios.js       # Pre-configured Axios client (credentials enabled)
        ├── context/
        │   └── AuthContext.jsx# Global state management for user authentication
        ├── components/
        │   ├── BlogCard.jsx   # Card displaying blog snippet, image, author
        │   ├── LoginForm.jsx  # Controlled login form component
        │   ├── RegisterForm.jsx # Controlled registration form component
        │   └── layouts/
        │       ├── Header.jsx    # Top navigation bar component
        │       └── MainLayout.jsx# Shell layout for authenticated routes
        ├── pages/
        │   ├── static/
        │   │   └── Landing.jsx   # Public landing hero page
        │   ├── auth/
        │   │   ├── Login.jsx     # Login page wrapper
        │   │   └── Register.jsx  # Register page wrapper
        │   ├── Dashboard.jsx     # Main feed displaying all blog posts
        │   ├── BlogDetail.jsx    # Single post view page with edit/delete options
        │   ├── CreateBlog.jsx    # Blog creation form page with image upload
        │   ├── EditBlog.jsx      # Blog edit page
        │   └── Profile.jsx       # User profile page
        ├── App.jsx            # React Router setup and page routing
        └── main.jsx           # App mounting point with React DOM & AuthProvider
```

---

# ⚙️ PART 1: BACKEND DEVELOPMENT (Step-by-Step)

### Step 1: Initialize Backend Project (`server/package.json`)
Create the `server` directory and run `npm init -y`. Configure ES Modules (`"type": "module"`).

```json
// server/package.json
// Purpose: Defines backend dependencies, npm scripts, and ES Module config.
{
  "name": "server",
  "version": "1.0.0",
  "description": "Blog CRUD application server",
  "main": "server.js",
  "type": "module", // Enables ES module syntax (import/export)
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js" // Development auto-restart server
  },
  "dependencies": {
    "bcrypt": "^5.1.1",         // Password hashing library
    "connect-mongo": "^5.1.0",   // MongoDB session store for express-session
    "cors": "^2.8.5",            // Cross-Origin Resource Sharing middleware
    "dotenv": "^16.4.7",        // Loads environment variables from .env
    "express": "^4.19.2",       // Core HTTP server framework
    "express-session": "^1.18.0",// Session management middleware
    "mongoose": "^8.3.1",       // Object Data Modeling (ODM) library for MongoDB
    "multer": "^1.4.5-lts.1"   // Multipart form-data middleware for file uploads
  },
  "devDependencies": {
    "nodemon": "^3.1.0"         // Utility that monitors changes and restarts server
  }
}
```

---

### Step 2: Configure Environment Variables (`server/.env`)
Store sensitive credentials and configurable values.

```env
# server/.env
# Purpose: Environment variables for environment isolation and security
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/blog-app
SESSION_SECRET=super-secret-long-secret-key
```

---

### Step 3: Database Connection (`server/database/db.connection.js`)
Establish connection to MongoDB database using Mongoose.

```javascript
// server/database/db.connection.js
// Purpose: Handles database initialization and connection handling
import mongoose from "mongoose";

const connectDb = () => {
  // Connect to MongoDB using connection string from environment variables
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Database connected successfully.");
    })
    .catch((error) => {
      console.log("Database connection error:", error.message);
    });
};

export default connectDb;
```

---

### Step 4: Define Data Schemas & Models

#### User Model (`server/models/user.model.js`)
```javascript
// server/models/user.model.js
// Purpose: Mongoose Schema defining User properties (credentials, bio, avatar)
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // Hashed password string
    },
    avatar: {
      type: String,
      default: null, // URL / file path for profile picture
    },
    bio: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically includes createdAt and updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;
```

#### Blog Model (`server/models/blog.model.js`)
```javascript
// server/models/blog.model.js
// Purpose: Mongoose Schema for Blog posts with relation to User author
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null, // Image URL / upload relative path
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Foreign key reference to User model
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
```

---

### Step 5: Implement Middlewares

#### Authentication Protection (`server/middelwares/auth.middleware.js`)
```javascript
// server/middelwares/auth.middleware.js
// Purpose: Middleware to enforce session authentication on protected API endpoints
export const isAuthenticated = (req, res, next) => {
  // Check if session exists and user is logged in
  if (req.session && req.session.user) {
    return next(); // User authenticated, proceed to controller
  }

  return res.status(401).json({
    message: "Unauthorized, please login",
  });
};
```

#### Multer Image File Upload Config (`server/middelwares/upload.js`)
```javascript
// server/middelwares/upload.js
// Purpose: Configures file storage location, naming conventions, and file filters
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure static upload folder exists on server disk
const uploadDir = path.join(process.cwd(), "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    // Generate unique timestamp filename to avoid naming collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Restrict uploads to image mime types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maximum file size 5MB
});

export default upload;
```

---

### Step 6: Create Controllers

#### Auth Controller (`server/controllers/auth.controller.js`)
Handles User registration, password comparison for login, session creation, logout, and self user retrieval.

```javascript
// server/controllers/auth.controller.js
// Purpose: Contains handler logic for authentication routes
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

// User Registration Handler
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password with salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Store user data in session
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
    };
    req.session.user = userData;

    return res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// User Login Handler
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
    };
    req.session.user = userData;

    return res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// User Logout Handler
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
};

// Get Current Authenticated User Handler
export const getMe = (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  return res.status(200).json({ user: null });
};
```

#### Blog Controller (`server/controllers/blog.controller.js`)
Handles CRUD operations (Get all blogs, Get blog by ID, Create post with image, Update, Delete).

```javascript
// server/controllers/blog.controller.js
// Purpose: Handles logic for fetching, creating, updating, and deleting blogs
import Blog from "../models/blog.model.js";

// Get All Blogs with populated author info
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "username email avatar")
      .sort({ createdAt: -1 }); // Newest first
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Blog Post by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "username email avatar bio"
    );
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create New Blog Post
export const createBlog = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    const imagePath = req.file ? `/upload/${req.file.filename}` : null;

    const newBlog = await Blog.create({
      title,
      body,
      image: imagePath,
      author: req.session.user._id,
    });

    const populatedBlog = await Blog.findById(newBlog._id).populate(
      "author",
      "username email avatar"
    );

    res.status(201).json(populatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Blog Post (Author check required)
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Enforce authorization
    if (blog.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this blog" });
    }

    const { title, body } = req.body;
    if (title) blog.title = title;
    if (body) blog.body = body;
    if (req.file) blog.image = `/upload/${req.file.filename}`;

    await blog.save();

    const updated = await Blog.findById(blog._id).populate(
      "author",
      "username email avatar"
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Blog Post (Author check required)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

### Step 7: Define API Routes

#### `server/routes/auth.route.js`
```javascript
// server/routes/auth.route.js
// Purpose: Maps HTTP requests for authentication to Auth controller actions
import express from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);

export default router;
```

#### `server/routes/blog.route.js`
```javascript
// server/routes/blog.route.js
// Purpose: Maps HTTP requests for blog operations and attaches auth/upload middlewares
import express from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { isAuthenticated } from "../middelwares/auth.middleware.js";
import upload from "../middelwares/upload.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", isAuthenticated, upload.single("image"), createBlog);
router.put("/:id", isAuthenticated, upload.single("image"), updateBlog);
router.delete("/:id", isAuthenticated, deleteBlog);

export default router;
```

#### `server/routes/route.js` (Main Router Aggregator)
```javascript
// server/routes/route.js
// Purpose: Combines all route modules under a single main API router
import express from "express";
import authRoutes from "./auth.route.js";
import blogRoutes from "./blog.route.js";
import userRoutes from "./user.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/users", userRoutes);

export default router;
```

---

### Step 8: Create Server Entry Point (`server/server.js`)
Configures middleware (CORS, body parser, session store with `connect-mongo`), static upload hosting, API routing, database invocation, and port listener.

```javascript
// server/server.js
// Purpose: Main backend server startup file
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import fs from "fs";

import router from "./routes/route.js";
import connectDb from "./database/db.connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blog-app";

// Ensure upload directory exists for disk storage
const uploadDir = path.join(process.cwd(), "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Enable CORS for frontend client domain with cookies/credentials allowed
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session configuration with MongoDB persistence
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// Expose upload directory statically for uploaded blog images
app.use("/upload", express.static(uploadDir));

// Attach API Routes under /api prefix
app.use("/api", router);

// Root health check route
app.get("/", (req, res) => {
  res.send("Server is up and running.");
});

// Connect to DB and start listening
connectDb();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

---

# 💻 PART 2: FRONTEND DEVELOPMENT (Step-by-Step)

### Step 1: Initialize React + Vite Project (`client/package.json`)
Run `npx create-vite client --template react` and install dependencies.

```json
// client/package.json
// Purpose: Frontend project declaration and NPM packages
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",               // Start development server
    "build": "vite build",       // Build production asset bundle
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.8",             // HTTP client for API interaction
    "lucide-react": "^0.368.0",    // UI Icon set
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3" // Router for single-page client routing
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",       // Utility CSS framework
    "vite": "^5.2.0"
  }
}
```

---

### Step 2: Create Axios HTTP Client Instance (`client/src/api/axios.js`)
Configures Axios base URL and credentials handling (`withCredentials: true`) to automatically send session cookies.

```javascript
// client/src/api/axios.js
// Purpose: Pre-configured Axios instance for sending HTTP requests to backend
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api", // Backend API target
  withCredentials: true,                // Enables cross-site session cookies
});

export default API;
```

---

### Step 3: Global Auth Context (`client/src/context/AuthContext.jsx`)
Provides current logged-in user state and helper methods (`login`, `register`, `logout`) to the entire React component tree.

```javascript
// client/src/context/AuthContext.jsx
// Purpose: React Context for managing authentication state globally
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth session status when app loads
  const checkAuth = async () => {
    try {
      const res = await API.get("/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await API.post("/auth/login", credentials);
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await API.post("/auth/register", userData);
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume AuthContext easily in components
export const useAuth = () => useContext(AuthContext);
```

---

### Step 4: Component & Layout Development

#### Layout Shell (`client/src/components/layouts/MainLayout.jsx`)
Wraps protected pages with constant Header and main content layout.

```jsx
// client/src/components/layouts/MainLayout.jsx
// Purpose: Layout structure containing sticky Header navigation and main page container
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Renders matching child page route */}
        <Outlet />
      </main>
    </div>
  );
}
```

#### Blog Card (`client/src/components/BlogCard.jsx`)
Reusable post snippet component.

```jsx
// client/src/components/BlogCard.jsx
// Purpose: Renders blog card with image thumbnail, title, preview text, author badge
import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  const imageUrl = blog.image
    ? `http://localhost:3000${blog.image}`
    : "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop";

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition">
      <img src={imageUrl} alt={blog.title} className="w-full h-48 object-cover" />
      <div className="p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white line-clamp-1 mb-2">
            {blog.title}
          </h2>
          <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{blog.body}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">
            By {blog.author?.username || "Anonymous"}
          </span>
          <Link
            to={`/blog/${blog._id}`}
            className="text-xs text-purple-400 font-medium hover:underline"
          >
            Read Article →
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 5: Page Component Development

#### Dashboard Page (`client/src/pages/Dashboard.jsx`)
Fetches and displays blog feed from backend API.

```jsx
// client/src/pages/Dashboard.jsx
// Purpose: Main feed fetching all blog posts from GET /api/blogs
import { useEffect, useState } from "react";
import API from "../api/axios";
import BlogCard from "../components/BlogCard";

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/blogs")
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-zinc-400">Loading feeds...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Latest Blog Posts</h1>
      {blogs.length === 0 ? (
        <p className="text-zinc-500">No blog posts created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Step 6: Application Router & Mount Configuration

#### Main Router Setup (`client/src/App.jsx`)
```jsx
// client/src/App.jsx
// Purpose: Configures client routes, layout bindings, and AuthProvider wrapper
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/static/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import BlogDetail from "./pages/BlogDetail";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import Profile from "./pages/Profile";
import MainLayout from "./components/layouts/MainLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/write" element={<CreateBlog />} />
            <Route path="/edit/:id" element={<EditBlog />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

#### Entry Point (`client/src/main.jsx`)
```jsx
// client/src/main.jsx
// Purpose: React application root mounting file
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

# 🚀 How to Run the Application

1. **Start MongoDB**: Ensure MongoDB service is running locally on port `27017` or update `MONGODB_URI` in `server/.env`.
2. **Start Backend Server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. **Start Frontend Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. **Access in Browser**: Open `http://localhost:5173`.
