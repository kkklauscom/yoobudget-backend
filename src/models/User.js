import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    budgetRatio: {
      needs: {
        type: Number,
        default: 50,
      },
      wants: {
        type: Number,
        default: 30,
      },
      savings: {
        type: Number,
        default: 20,
      },
    },
    currentSavings: {
      type: Number,
      default: 0,
    },
    viewCycle: {
      type: String,
      enum: ["weekly", "fortnightly", "monthly", "yearly"],
      default: "monthly",
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
    timestamps: false, // We handle createdAt/updatedAt manually
  }
);

// Pre-save hook to update updatedAt
userSchema.pre("save", function (next) {
  if (this.isNew) {
    this.createdAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-update hook for findOneAndUpdate
userSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.model("User", userSchema);

