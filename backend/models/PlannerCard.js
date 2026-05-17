import mongoose from "mongoose";

const plannerCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      enum: ["Instagram", "YouTube", "LinkedIn", "Twitter", "TikTok"],
      default: "Instagram",
    },
    status: {
      type: String,
      enum: ["Idea", "Script", "Shoot", "Edit", "Posted"],
      default: "Idea",
    },
    dueDate: {
      type: Date,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export default mongoose.model("PlannerCard", plannerCardSchema);
