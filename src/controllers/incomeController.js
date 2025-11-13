import Income from "../models/Income.js";
import { calculateCycle, calculateRemainingDays, isDateInCycle } from "../utils/cycle.js";

/**
 * Ensure only one main income exists for a user
 * If a new income is set as main, unset all others
 */
const ensureSingleMainIncome = async (userId, excludeId = null) => {
  const updateQuery = { userId, isMain: true };
  if (excludeId) {
    updateQuery._id = { $ne: excludeId };
  }

  await Income.updateMany(updateQuery, { $set: { isMain: false } });
};

/**
 * Calculate total income for a cycle
 * Includes recurring incomes and one-time incomes that fall within the cycle
 */
const calculateTotalIncome = async (userId, cycleStart, cycleEnd) => {
  const incomes = await Income.find({ userId });
  let totalIncome = 0;

  for (const income of incomes) {
    if (income.payCycle === "one-time") {
      // One-time income: only count if nextPayDate is within cycle
      if (isDateInCycle(income.nextPayDate, cycleStart, cycleEnd)) {
        totalIncome += income.amount;
      }
    } else {
      // Recurring income: count all occurrences within cycle
      const occurrences = getIncomeOccurrencesInCycle(
        income,
        cycleStart,
        cycleEnd
      );
      totalIncome += income.amount * occurrences;
    }
  }

  return totalIncome;
};

/**
 * Get number of income occurrences within a cycle for recurring incomes
 */
const getIncomeOccurrencesInCycle = (income, cycleStart, cycleEnd) => {
  if (income.payCycle === "one-time") {
    return 0;
  }

  const start = new Date(cycleStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(cycleEnd);
  end.setHours(23, 59, 59, 999);

  const occurrences = [];
  let currentDate = new Date(income.nextPayDate);
  currentDate.setHours(0, 0, 0, 0);

  // If nextPayDate is before cycleStart, move forward to find first occurrence in cycle
  while (currentDate < start) {
    currentDate = addInterval(currentDate, income.payCycle);
  }

  // If nextPayDate is after cycleEnd, move backward to find last occurrence before cycleEnd
  if (currentDate > end) {
    currentDate = new Date(income.nextPayDate);
    currentDate.setHours(0, 0, 0, 0);
    while (currentDate > end) {
      currentDate = subtractInterval(currentDate, income.payCycle);
    }
    // Now move forward from this point
    while (currentDate < start) {
      currentDate = addInterval(currentDate, income.payCycle);
    }
  }

  // Collect all occurrences within the cycle
  while (currentDate >= start && currentDate < end) {
    occurrences.push(new Date(currentDate));
    currentDate = addInterval(currentDate, income.payCycle);
  }

  return occurrences.length;
};

/**
 * Add interval to date based on payCycle
 */
const addInterval = (date, payCycle) => {
  const newDate = new Date(date);
  switch (payCycle) {
    case "weekly":
      newDate.setDate(newDate.getDate() + 7);
      break;
    case "biweekly":
      newDate.setDate(newDate.getDate() + 14);
      break;
    case "monthly":
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    default:
      break;
  }
  return newDate;
};

/**
 * Subtract interval from date based on payCycle
 */
const subtractInterval = (date, payCycle) => {
  const newDate = new Date(date);
  switch (payCycle) {
    case "weekly":
      newDate.setDate(newDate.getDate() - 7);
      break;
    case "biweekly":
      newDate.setDate(newDate.getDate() - 14);
      break;
    case "monthly":
      newDate.setMonth(newDate.getMonth() - 1);
      break;
    default:
      break;
  }
  return newDate;
};

// POST /api/income
export const createIncome = async (req, res) => {
  try {
    const { name, amount, payCycle, nextPayDate, isMain } = req.body;

    // Validate required fields
    if (!amount || !payCycle || !nextPayDate) {
      return res.status(400).json({
        error: "amount, payCycle, and nextPayDate are required",
      });
    }

    if (!["weekly", "biweekly", "monthly", "one-time"].includes(payCycle)) {
      return res.status(400).json({
        error: "payCycle must be: weekly, biweekly, monthly, or one-time",
      });
    }

    // If setting as main, ensure no other income is main
    if (isMain === true) {
      await ensureSingleMainIncome(req.userId);
    }

    // Prepare income data
    const incomeData = {
      userId: req.userId,
      name: name || "Income",
      amount,
      payCycle,
      nextPayDate: new Date(nextPayDate),
      isMain: isMain || false,
    };

    const income = await Income.create(incomeData);

    res.status(201).json(income);
  } catch (error) {
    console.error("Create income error:", error);
    res.status(500).json({
      error: error.message || "Server error during income creation",
    });
  }
};

// GET /api/income
export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    console.error("Get incomes error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// GET /api/income/main
export const getMainIncome = async (req, res) => {
  try {
    const mainIncome = await Income.findOne({
      userId: req.userId,
      isMain: true,
    });

    if (!mainIncome) {
      return res.status(200).json({
        mainIncome: null,
      });
    }

    res.status(200).json({
      mainIncome,
    });
  } catch (error) {
    console.error("Get main income error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// POST /api/income/set-main/:id
export const setMainIncome = async (req, res) => {
  try {
    const { id } = req.params;

    // Find income and verify ownership
    const income = await Income.findOne({ _id: id, userId: req.userId });
    if (!income) {
      return res.status(404).json({
        error: "Income not found",
      });
    }

    // Set all user's incomes to isMain = false
    await ensureSingleMainIncome(req.userId, id);

    // Set target income to isMain = true
    income.isMain = true;
    await income.save();

    res.status(200).json(income);
  } catch (error) {
    console.error("Set main income error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// GET /api/income/view-cycle
export const getViewCycle = async (req, res) => {
  try {
    // Fetch user's main income
    const mainIncome = await Income.findOne({
      userId: req.userId,
      isMain: true,
    });

    if (!mainIncome) {
      return res.status(400).json({
        error: "NO_MAIN_INCOME",
      });
    }

    // One-time income doesn't define a cycle
    if (mainIncome.payCycle === "one-time") {
      return res.status(400).json({
        error: "One-time income cannot be used as main income for cycle calculation",
      });
    }

    // Calculate cycle
    const { cycleStart, cycleEnd } = calculateCycle(mainIncome);

    // Calculate remaining days
    const remainingDays = calculateRemainingDays(cycleEnd);

    // Calculate total income in cycle
    const totalIncome = await calculateTotalIncome(
      req.userId,
      cycleStart,
      cycleEnd
    );

    res.status(200).json({
      cycleStart,
      cycleEnd,
      payCycle: mainIncome.payCycle,
      remainingDays,
      totalIncome,
    });
  } catch (error) {
    console.error("Get view cycle error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// PUT /api/income/:id
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, payCycle, nextPayDate, isMain } = req.body;

    // Find income and verify ownership
    const income = await Income.findOne({ _id: id, userId: req.userId });
    if (!income) {
      return res.status(404).json({
        error: "Income not found",
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = amount;
    if (payCycle !== undefined) {
      if (!["weekly", "biweekly", "monthly", "one-time"].includes(payCycle)) {
        return res.status(400).json({
          error: "payCycle must be: weekly, biweekly, monthly, or one-time",
        });
      }
      updateData.payCycle = payCycle;
    }
    if (nextPayDate !== undefined)
      updateData.nextPayDate = new Date(nextPayDate);
    if (isMain !== undefined) {
      updateData.isMain = isMain;
      // If setting as main, ensure no other income is main
      if (isMain === true) {
        await ensureSingleMainIncome(req.userId, id);
      }
    }

    // Update income
    const updatedIncome = await Income.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedIncome);
  } catch (error) {
    console.error("Update income error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// DELETE /api/income/:id
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await Income.findOneAndDelete({ _id: id, userId: req.userId });
    if (!income) {
      return res.status(404).json({
        error: "Income not found",
      });
    }

    res.status(200).json({
      message: "Income deleted",
    });
  } catch (error) {
    console.error("Delete income error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};
