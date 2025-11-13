import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    spendFrom: {
      type: String,
      enum: ["needs", "wants", "savings"],
      required: true,
    },
    expenseType: {
      type: String,
      enum: ["one-time", "recurring"],
      required: true,
    },
    payCycle: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      required: function () {
        return this.expenseType === "recurring";
      },
    },
    createdAt: {
      type: Date,
      required: function () {
        return this.expenseType === "one-time";
      },
    },
    nextPaymentDate: {
      type: Date,
      required: function () {
        return this.expenseType === "recurring";
      },
    },
    created: {
      type: Date,
      default: Date.now,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We handle created/updated manually
  }
);

// Pre-save hook to update updated timestamp
expenseSchema.pre("save", function (next) {
  this.updated = Date.now();
  next();
});

// Pre-update hook for findOneAndUpdate
expenseSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updated: Date.now() });
  next();
});

export default mongoose.model("Expense", expenseSchema);

