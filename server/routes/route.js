import express from "express";
import authRoutes from "./auth.route.js";
import blogRoutes from "./blog.route.js";
import userRoutes from "./user.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/users", userRoutes);

export default router;
