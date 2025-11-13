import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "Income",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["recurring", "one-time"],
      required: true,
    },
    frequency: {
      type: String,
      enum: ["weekly", "fortnightly", "monthly", "yearly", null],
      default: null,
    },
    nextPayDate: {
      type: Date,
      required: function () {
        return this.type === "recurring";
      },
    },
    isFirstPayDay: {
      type: Boolean,
      default: false,
    },
    lastPayDate: {
      type: Date,
      default: null,
    },
    oneTimeDate: {
      type: Date,
      required: function () {
        return this.type === "one-time";
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Pre-save hook to update updatedAt
incomeSchema.pre("save", function (next) {
  if (this.isNew) {
    this.createdAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-update hook for findOneAndUpdate
incomeSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.model("Income", incomeSchema);

