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
