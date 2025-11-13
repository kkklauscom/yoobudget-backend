import User from "../models/User.js";
import { validateViewCycle } from "../utils/viewCycleValidation.js";

// Helper function to format user response (without passwordHash)
const formatUserResponse = (user) => {
  // Ensure data consistency: if viewCycle is monthly but monthDate is null, use default 1
  let finalMonthDate = user.monthDate;
  if (user.viewCycle === "monthly" && (finalMonthDate === null || finalMonthDate === undefined)) {
    finalMonthDate = 1;
  }
  
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    budgetRatio: user.budgetRatio,
    currentSavings: user.currentSavings,
    viewCycle: user.viewCycle,
    weekDay: user.weekDay,
    fortnightStartDay: user.fortnightStartDay,
    monthDate: finalMonthDate,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// GET /users/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(formatUserResponse(user));
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// PATCH /users/me
export const updateMe = async (req, res) => {
  try {
    const {
      name,
      budgetRatio,
      viewCycle,
      weekDay,
      fortnightStartDay,
      monthDate,
    } = req.body;

    // Get current user to merge with update data
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (budgetRatio !== undefined) {
      updateData.budgetRatio = budgetRatio;
    }

    // Handle viewCycle and cycle fields
    const newViewCycle = viewCycle !== undefined ? viewCycle : currentUser.viewCycle;
    const newWeekDay = weekDay !== undefined ? weekDay : currentUser.weekDay;
    const newFortnightStartDay =
      fortnightStartDay !== undefined
        ? fortnightStartDay
        : currentUser.fortnightStartDay;
    const newMonthDate =
      monthDate !== undefined ? monthDate : currentUser.monthDate;

    // Validate viewCycle and cycle fields
    const validation = validateViewCycle(
      newViewCycle,
      newWeekDay,
      newFortnightStartDay,
      newMonthDate
    );

    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.error,
      });
    }

    // Set viewCycle and cycle fields
    updateData.viewCycle = newViewCycle;
    updateData.weekDay = validation.cleanedData.weekDay;
    updateData.fortnightStartDay = validation.cleanedData.fortnightStartDay;
    updateData.monthDate = validation.cleanedData.monthDate;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(formatUserResponse(user));
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

