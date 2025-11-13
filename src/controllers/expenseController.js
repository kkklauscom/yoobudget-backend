import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import { calculateCycle } from "../utils/cycle.js";

/**
 * Get current cycle for user based on main income
 * Returns cycleStart and cycleEnd
 */
const getCurrentCycle = async (userId) => {
  const mainIncome = await Income.findOne({
    userId,
    isMain: true,
  });

  if (!mainIncome) {
    throw new Error("NO_MAIN_INCOME");
  }

  if (mainIncome.payCycle === "one-time") {
    throw new Error("One-time income cannot be used as main income for cycle calculation");
  }

  return calculateCycle(mainIncome);
};

// POST /api/expense/add
export const addExpense = async (req, res) => {
  try {
    const {
      name,
      amount,
      category,
      note,
      spendFrom,
      expenseType,
      payCycle,
      createdAt,
      nextPaymentDate,
    } = req.body;

    // Validate required fields
    if (!name || !amount || !category || !spendFrom || !expenseType) {
      return res.status(400).json({
        error: "name, amount, category, spendFrom, and expenseType are required",
      });
    }

    // Validate spendFrom
    if (!["needs", "wants", "savings"].includes(spendFrom)) {
      return res.status(400).json({
        error: "spendFrom must be: needs, wants, or savings",
      });
    }

    // Validate expenseType
    if (!["one-time", "recurring"].includes(expenseType)) {
      return res.status(400).json({
        error: "expenseType must be: one-time or recurring",
      });
    }

    // Prepare expense data
    const expenseData = {
      userId: req.userId,
      name,
      amount,
      category,
      note: note || "",
      spendFrom,
      expenseType,
    };

    if (expenseType === "one-time") {
      // For one-time: use createdAt (or current date if not provided)
      expenseData.createdAt = createdAt ? new Date(createdAt) : new Date();
      expenseData.payCycle = undefined;
      expenseData.nextPaymentDate = undefined;
    } else if (expenseType === "recurring") {
      // For recurring: require payCycle and nextPaymentDate
      if (!payCycle) {
        return res.status(400).json({
          error: "payCycle is required for recurring expenses",
        });
      }
      if (!["weekly", "biweekly", "monthly"].includes(payCycle)) {
        return res.status(400).json({
          error: "payCycle must be: weekly, biweekly, or monthly",
        });
      }
      if (!nextPaymentDate) {
        return res.status(400).json({
          error: "nextPaymentDate is required for recurring expenses",
        });
      }
      expenseData.payCycle = payCycle;
      expenseData.nextPaymentDate = new Date(nextPaymentDate);
      expenseData.createdAt = undefined;
    }

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({
      error: error.message || "Server error during expense creation",
    });
  }
};

// GET /api/expense/current-cycle
export const getCurrentCycleExpenses = async (req, res) => {
  try {
    // Get current cycle
    let cycleStart, cycleEnd;
    try {
      const cycle = await getCurrentCycle(req.userId);
      cycleStart = cycle.cycleStart;
      cycleEnd = cycle.cycleEnd;
    } catch (error) {
      if (error.message === "NO_MAIN_INCOME") {
        return res.status(400).json({
          error: "NO_MAIN_INCOME",
        });
      }
      throw error;
    }

    // Query one-time expenses in cycle
    const oneTimeExpenses = await Expense.find({
      userId: req.userId,
      expenseType: "one-time",
      createdAt: {
        $gte: cycleStart,
        $lt: cycleEnd,
      },
    });

    // Query recurring expenses in cycle
    const recurringExpenses = await Expense.find({
      userId: req.userId,
      expenseType: "recurring",
      nextPaymentDate: {
        $gte: cycleStart,
        $lt: cycleEnd,
      },
    });

    // Combine expenses
    const expenses = [...oneTimeExpenses, ...recurringExpenses].sort(
      (a, b) => {
        const dateA = a.expenseType === "one-time" ? a.createdAt : a.nextPaymentDate;
        const dateB = b.expenseType === "one-time" ? b.createdAt : b.nextPaymentDate;
        return dateA - dateB;
      }
    );

    res.status(200).json({
      cycleStart,
      cycleEnd,
      expenses,
    });
  } catch (error) {
    console.error("Get current cycle expenses error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// GET /api/expense/all
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({
      created: -1,
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get all expenses error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// PUT /api/expense/:id/update
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      category,
      note,
      spendFrom,
      expenseType,
      payCycle,
      createdAt,
      nextPaymentDate,
    } = req.body;

    // Find expense and verify ownership
    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    if (note !== undefined) updateData.note = note;
    if (spendFrom !== undefined) {
      if (!["needs", "wants", "savings"].includes(spendFrom)) {
        return res.status(400).json({
          error: "spendFrom must be: needs, wants, or savings",
        });
      }
      updateData.spendFrom = spendFrom;
    }
    if (expenseType !== undefined) {
      if (!["one-time", "recurring"].includes(expenseType)) {
        return res.status(400).json({
          error: "expenseType must be: one-time or recurring",
        });
      }
      updateData.expenseType = expenseType;
    }

    // Handle expenseType-specific fields
    const finalExpenseType = expenseType !== undefined ? expenseType : expense.expenseType;

    if (finalExpenseType === "one-time") {
      updateData.createdAt = createdAt ? new Date(createdAt) : expense.createdAt || new Date();
      updateData.payCycle = undefined;
      updateData.nextPaymentDate = undefined;
    } else if (finalExpenseType === "recurring") {
      if (payCycle !== undefined) {
        if (!["weekly", "biweekly", "monthly"].includes(payCycle)) {
          return res.status(400).json({
            error: "payCycle must be: weekly, biweekly, or monthly",
          });
        }
        updateData.payCycle = payCycle;
      }
      if (nextPaymentDate !== undefined) {
        updateData.nextPaymentDate = new Date(nextPaymentDate);
      }
      updateData.createdAt = undefined;
    }

    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// DELETE /api/expense/:id
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// GET /api/expense/categories
export const getCategories = async (req, res) => {
  try {
    const categories = [
      "Food",
      "Transport",
      "Housing",
      "Utilities",
      "Entertainment",
      "Shopping",
      "Healthcare",
      "Education",
      "Gifts",
      "Travel",
    ];

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

