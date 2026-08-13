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
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blog-app";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Enable CORS for frontend Vite dev server
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-long-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
      httpOnly: true,
      secure: false, // set to true in HTTPS production
      sameSite: "lax",
    },
  })
);

// Serve uploads statically
app.use("/upload", express.static(uploadDir));

// API Routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Server is up and running.");
});

connectDb();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});