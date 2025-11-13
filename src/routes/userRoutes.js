import express from "express";
import { getMe, updateMe } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

router.get("/me", getMe);
router.patch("/me", updateMe);

export default router;

