import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON body
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/expense", expenseRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "yoobudget API is running",
  });
});

export default app;
