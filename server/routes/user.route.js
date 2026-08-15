import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middelwares/auth.middleware.js";
import upload from "../middelwares/upload.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", isAuthenticated, upload.single("avatar"), updateUser);
router.delete("/:id", isAuthenticated, deleteUser);

export default router;
