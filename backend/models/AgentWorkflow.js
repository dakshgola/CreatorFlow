import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number },
  thought: { type: String }, // e.g. "I should fetch trends first."
  toolName: { type: String }, // e.g. "searchTrends"
  toolInput: { type: mongoose.Schema.Types.Mixed }, // e.g. { "niche": "Tech" }
  toolOutput: { type: String }, // The result from the tool
  timestamp: { type: Date, default: Date.now }
});

const agentWorkflowSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true }, // The user's initial goal
    
    status: { 
      type: String, 
      enum: ["planning", "executing", "completed", "failed"], 
      default: "planning" 
    },
    
    // The execution log mapping the ReAct loop
    steps: { type: [stepSchema], default: [] },
    
    // The final synthesized answer provided back to the user
    finalResult: { type: String, default: "" },
    
    errorLogs: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("AgentWorkflow", agentWorkflowSchema);
