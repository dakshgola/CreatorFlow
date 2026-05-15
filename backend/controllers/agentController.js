import AgentWorkflow from "../models/AgentWorkflow.js";
import { runAgentLoop } from "../services/agentOrchestrator.js";

// @desc    Start an autonomous AI agent workflow
// @route   POST /api/agents/run
// @access  Private
export const startAgentWorkflow = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    // 1. Create Workflow Record
    const workflow = await AgentWorkflow.create({
      userId: req.user.id,
      prompt,
      status: "planning"
    });

    // 2. Trigger the ReAct Loop in the background (Non-blocking)
    runAgentLoop(workflow._id, req.user.id, prompt);

    // 3. Return immediately so frontend can stream updates
    res.status(202).json({ 
      success: true, 
      message: "Agent started execution", 
      workflowId: workflow._id 
    });
  } catch (error) {
    console.error("START AGENT ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get the current execution state of an agent (for UI polling/streaming)
// @route   GET /api/agents/:id
// @access  Private
export const getAgentStatus = async (req, res) => {
  try {
    const workflow = await AgentWorkflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }
    
    if (workflow.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    console.error("GET AGENT ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
