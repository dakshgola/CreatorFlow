import mongoose from "mongoose";

const multiplierCampaignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    sourceContent: { type: String, required: true }, // The original long-form script/post
    
    status: { 
      type: String, 
      enum: ["processing", "completed", "failed"], 
      default: "processing" 
    },
    
    // Outputs for each platform
    outputs: {
      twitterThread: { type: [String], default: [] },
      linkedinPost: { type: String, default: "" },
      youtubeShortsScript: { type: String, default: "" },
      instagramCaption: { type: String, default: "" },
      newsletter: { type: String, default: "" }
    },
    
    errorLogs: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("MultiplierCampaign", multiplierCampaignSchema);
