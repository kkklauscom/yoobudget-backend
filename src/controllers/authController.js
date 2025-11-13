import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// POST /auth/register
export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      budgetRatio,
      viewCycle,
      currentSavings,
    } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    // Set default viewCycle and cycle fields
    const finalViewCycle = viewCycle || "monthly";
    
    // For registration, set default cycle fields based on viewCycle
    // Users can update these later via PATCH /users/me
    let weekDay = null;
    let fortnightStartDay = null;
    let monthDate = null;
    
    if (finalViewCycle === "monthly") {
      monthDate = 1; // Default to day 1 of the month
    }
    // For weekly and fortnightly, leave as null (user must set via update API)

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      email,
      passwordHash,
      name,
      budgetRatio: budgetRatio || {
        needs: 50,
        wants: 30,
        savings: 20,
      },
      viewCycle: finalViewCycle,
      currentSavings: currentSavings !== undefined ? currentSavings : 0,
      weekDay,
      fortnightStartDay,
      monthDate,
    };

    // Create user
    const user = await User.create(userData);

    // Generate JWT token
    const token = generateToken(user._id);

    // Return response
    res.status(201).json({
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: error.message || "Server error during registration",
    });
  }
};

// POST /auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return response
    res.status(200).json({
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: error.message || "Server error during login",
    });
  }
};

