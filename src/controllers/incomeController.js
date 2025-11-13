import Income from "../models/Income.js";
import { generatePayDatesInRange } from "../utils/paycycle.js";

/**
 * Validate income data based on type
 */
const validateIncomeData = (data) => {
  const { type, frequency, nextPayDate, lastPayDate, oneTimeDate, isFirstPayDay } = data;

  if (type === "one-time") {
    // For one-time: frequency, nextPayDate, lastPayDate must be null
    if (frequency !== null && frequency !== undefined) {
      throw new Error("frequency must be null for one-time income");
    }
    if (nextPayDate !== null && nextPayDate !== undefined) {
      throw new Error("nextPayDate must be null for one-time income");
    }
    if (lastPayDate !== null && lastPayDate !== undefined) {
      throw new Error("lastPayDate must be null for one-time income");
    }
    if (!oneTimeDate) {
      throw new Error("oneTimeDate is required for one-time income");
    }
  } else if (type === "recurring") {
    // For recurring: frequency and nextPayDate are required
    if (!frequency) {
      throw new Error("frequency is required for recurring income");
    }
    if (!nextPayDate) {
      throw new Error("nextPayDate is required for recurring income");
    }

    if (isFirstPayDay === true) {
      // If isFirstPayDay = true, lastPayDate MUST be null
      if (lastPayDate !== null && lastPayDate !== undefined) {
        throw new Error("lastPayDate must be null when isFirstPayDay is true");
      }
    } else {
      // If isFirstPayDay = false, lastPayDate is REQUIRED
      if (!lastPayDate) {
        throw new Error("lastPayDate is required when isFirstPayDay is false");
      }
    }
  }

  return true;
};

// POST /api/income
export const createIncome = async (req, res) => {
  try {
    const { name, amount, type, frequency, nextPayDate, lastPayDate, oneTimeDate, isFirstPayDay } = req.body;

    // Validate required fields
    if (!amount || !type) {
      return res.status(400).json({
        error: "amount and type are required",
      });
    }

    // Validate income data based on type
    try {
      validateIncomeData({
        type,
        frequency,
        nextPayDate,
        lastPayDate,
        oneTimeDate,
        isFirstPayDay,
      });
    } catch (validationError) {
      return res.status(400).json({
        error: validationError.message,
      });
    }

    // Prepare income data
    const incomeData = {
      userId: req.userId,
      name: name || "Income",
      amount,
      type,
    };

    if (type === "recurring") {
      incomeData.frequency = frequency;
      incomeData.nextPayDate = new Date(nextPayDate);
      incomeData.isFirstPayDay = isFirstPayDay || false;
      incomeData.lastPayDate = isFirstPayDay ? null : new Date(lastPayDate);
    } else if (type === "one-time") {
      incomeData.frequency = null;
      incomeData.nextPayDate = null;
      incomeData.lastPayDate = null;
      incomeData.isFirstPayDay = false;
      incomeData.oneTimeDate = new Date(oneTimeDate);
    }

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

// PUT /api/income/:id
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, type, frequency, nextPayDate, lastPayDate, oneTimeDate, isFirstPayDay } = req.body;

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
    if (type !== undefined) updateData.type = type;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (nextPayDate !== undefined) updateData.nextPayDate = nextPayDate ? new Date(nextPayDate) : null;
    if (lastPayDate !== undefined) updateData.lastPayDate = lastPayDate ? new Date(lastPayDate) : null;
    if (oneTimeDate !== undefined) updateData.oneTimeDate = oneTimeDate ? new Date(oneTimeDate) : null;
    if (isFirstPayDay !== undefined) updateData.isFirstPayDay = isFirstPayDay;

    // Merge with existing data for validation
    const mergedData = {
      type: updateData.type !== undefined ? updateData.type : income.type,
      frequency: updateData.frequency !== undefined ? updateData.frequency : income.frequency,
      nextPayDate: updateData.nextPayDate !== undefined ? updateData.nextPayDate : income.nextPayDate,
      lastPayDate: updateData.lastPayDate !== undefined ? updateData.lastPayDate : income.lastPayDate,
      oneTimeDate: updateData.oneTimeDate !== undefined ? updateData.oneTimeDate : income.oneTimeDate,
      isFirstPayDay: updateData.isFirstPayDay !== undefined ? updateData.isFirstPayDay : income.isFirstPayDay,
    };

    // Validate updated data
    try {
      validateIncomeData(mergedData);
    } catch (validationError) {
      return res.status(400).json({
        error: validationError.message,
      });
    }

    // Update income
    const updatedIncome = await Income.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

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

/**
 * Get income events for a date range
 * Used for summary calculations
 * @param {string} userId - User ID
 * @param {Date} rangeStart - Start of date range
 * @param {Date} rangeEnd - End of date range
 * @returns {Array} - Array of { incomeId, amount, payDate }
 */
export const getIncomeEvents = async (userId, rangeStart, rangeEnd) => {
  try {
    const incomes = await Income.find({ userId });
    const events = [];

    for (const income of incomes) {
      const payDates = generatePayDatesInRange(income, rangeStart, rangeEnd);

      for (const payDate of payDates) {
        events.push({
          incomeId: income._id,
          amount: income.amount,
          payDate: payDate,
        });
      }
    }

    return events;
  } catch (error) {
    console.error("Get income events error:", error);
    throw error;
  }
};

