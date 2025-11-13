import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addExpense,
  getCurrentCycleExpenses,
  getAllExpenses,
  updateExpense,
  deleteExpense,
  getCategories,
} from "../controllers/expenseController.js";

const router = express.Router();

// All expense routes require authentication
router.use(authMiddleware);

router.post("/add", addExpense);
router.get("/current-cycle", getCurrentCycleExpenses);
router.get("/all", getAllExpenses);
router.get("/categories", getCategories);
router.put("/:id/update", updateExpense);
router.delete("/:id", deleteExpense);

export default router;

