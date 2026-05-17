import mongoose from "mongoose";

const contentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["idea", "caption", "score"],
      required: true,
    },
    input: {
      type: Object, // what the user submitted
    },
    output: {
      type: Object, // what Gemini returned
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ContentHistory", contentHistorySchema);
