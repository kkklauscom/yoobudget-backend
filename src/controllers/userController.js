import User from "../models/User.js";

// Helper function to format user response (without passwordHash)
const formatUserResponse = (user) => {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    budgetRatio: user.budgetRatio,
    currentSavings: user.currentSavings,
    viewCycle: user.viewCycle,
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
    const { name, budgetRatio, viewCycle } = req.body;

    // Build update object (only allow name, budgetRatio, viewCycle)
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (budgetRatio !== undefined) {
      updateData.budgetRatio = budgetRatio;
    }
    if (viewCycle !== undefined) {
      if (!["weekly", "fortnightly", "monthly", "yearly"].includes(viewCycle)) {
        return res.status(400).json({
          error: "Invalid viewCycle. Must be: weekly, fortnightly, monthly, or yearly",
        });
      }
      updateData.viewCycle = viewCycle;
    }

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

