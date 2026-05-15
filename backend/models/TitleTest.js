import mongoose from "mongoose";

const titleTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  generatedTitles: [{ type: String }],
  winningTitle: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

titleTestSchema.index({ userId: 1 });
titleTestSchema.index({ createdAt: -1 });

export default mongoose.model("TitleTest", titleTestSchema);
