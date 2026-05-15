import { GoogleGenerativeAI } from "@google/generative-ai";
import AgentWorkflow from "../models/AgentWorkflow.js";
import { availableTools, executeTool } from "./agentTools.js";

// The ReAct Loop (Reason -> Act -> Observe)
export const runAgentLoop = async (workflowId, userId, prompt) => {
  const MAX_ITERATIONS = 5;
  let iteration = 0;
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // We use a model that supports function calling natively
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: availableTools }]
    });

    let chatHistory = [
      { role: "user", parts: [{ text: prompt }] }
    ];

    const chat = model.startChat({ history: [] });

    await AgentWorkflow.findByIdAndUpdate(workflowId, { status: "executing" });

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      // 1. THINK: Send the conversation history to the model
      const result = await chat.sendMessage(chatHistory[chatHistory.length - 1].parts);
      const response = result.response;
      
      const functionCall = response.functionCalls ? response.functionCalls()[0] : null;
      const textResponse = response.text ? response.text() : "";

      // 2. Decide if we are done or need to call a tool
      if (!functionCall) {
        // The agent thinks it has the final answer
        await AgentWorkflow.findByIdAndUpdate(workflowId, { 
          status: "completed",
          finalResult: textResponse 
        });
        return; // Break the loop
      }

      // 3. ACT: Extract tool call request
      const toolName = functionCall.name;
      const toolArgs = functionCall.args;
      
      // Save the "Thought" and "Action" to DB so the UI can stream it
      await AgentWorkflow.findByIdAndUpdate(workflowId, {
        $push: {
          steps: {
            stepNumber: iteration,
            thought: `I need to use ${toolName}`,
            toolName: toolName,
            toolInput: toolArgs,
            timestamp: new Date()
          }
        }
      });

      // 4. EXECUTE & OBSERVE: Run the backend tool
      const toolOutput = await executeTool(toolName, toolArgs, userId);

      // Save the output to DB
      await AgentWorkflow.findOneAndUpdate(
        { _id: workflowId, "steps.stepNumber": iteration },
        { $set: { "steps.$.toolOutput": toolOutput } }
      );

      // Append observation to chat history so the agent knows the result
      chatHistory.push({
        role: "model",
        parts: [{ functionCall: { name: toolName, args: toolArgs } }]
      });
      
      chatHistory.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: toolName,
            response: { result: toolOutput }
          }
        }]
      });
    }

    // If we hit MAX_ITERATIONS
    await AgentWorkflow.findByIdAndUpdate(workflowId, { 
      status: "failed",
      $push: { errorLogs: "Agent reached max iterations without finding an answer." }
    });

  } catch (error) {
    console.error("AGENT LOOP ERROR:", error);
    await AgentWorkflow.findByIdAndUpdate(workflowId, { 
      status: "failed",
      $push: { errorLogs: error.message }
    });
  }
};
