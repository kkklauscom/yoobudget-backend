import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
} from "../controllers/incomeController.js";

const router = express.Router();

// All income routes require authentication
router.use(authMiddleware);

router.post("/", createIncome);
router.get("/", getIncomes);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;

