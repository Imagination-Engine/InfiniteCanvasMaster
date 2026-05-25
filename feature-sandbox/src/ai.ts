import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppType } from "./store";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "dummy");

// Standard chat model
const chatModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// JSON-enforced model for workflows
const jsonModel = genAI.getGenerativeModel({
  model: "gemini-3.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

export async function chatAboutGoal(
  message: string,
  isRefining: boolean = false,
) {
  const systemPrompt = isRefining
    ? "You are a workflow architect. The user is asking you to modify their current workflow. Acknowledge their request briefly."
    : `You are an AI architect. The user wants to build an application or script.
    Help them define: 
    1. App Type (Web App, Desktop App, or CLI Tool).
    2. Use-cases and core features.
    3. Target audience.
    
    Keep it conversational. Once you have enough info to build an MVP, say 'Let's generate the workflow!' and mention if it is a WEB, DESKTOP, or CLI app.`;

  const prompt = `${systemPrompt}\n\nUser: ${message}`;
  const result = await chatModel.generateContent(prompt);
  return result.response.text();
}

export async function identifyAppType(history: string): Promise<AppType> {
  const prompt = `Analyze this conversation history and determine if the user wants a WEB, DESKTOP, or CLI application. 
  History: ${history}
  Return ONLY JSON: { "type": "WEB" | "DESKTOP" | "CLI" }`;

  const result = await jsonModel.generateContent(prompt);
  const data = JSON.parse(result.response.text());
  return data.type as AppType;
}

export async function generateWorkflowPlan(
  goal: string,
  appType: AppType,
  modifications: string = "",
) {
  const typeSpecificInstructions = {
    WEB: "Focus on HTML, CSS (Tailwind/Vanilla), and JS. Ensure it is responsive and has a clear entry point (index.html).",
    DESKTOP:
      "Use Python (Tkinter/PyQt). MUST include nodes for: 1. Core Logic, 2. requirements.txt, 3. install_windows.bat, 4. install_mac.command. The .bat/.command scripts must create a venv, install dependencies, and run the app.",
    CLI: "Use Python. MUST include nodes for: 1. Core Logic, 2. requirements.txt, 3. install_windows.bat, 4. install_mac.command. The scripts must setup a venv and run the tool.",
    UNKNOWN: "",
  };

  const prompt = `You are a workflow planner for a ${appType} application.
  Goal: "${goal}"
  ${modifications ? `Modifications: "${modifications}"` : ""}
  ${typeSpecificInstructions[appType]}
  
  Create a sequence of logical nodes. Each node takes the PREVIOUSLY GENERATED CODEBASE as 'input'.
  Nodes should have:
  - id: unique string
  - label: short name
  - instruction: what the AI should generate here.
  
  MANDATORY: 
  - For Desktop/CLI, you MUST have nodes for OS-specific installers (.bat and .command).
  - The second-to-last node MUST be 'QA Review'. Instruction: 'Review all previous files for bugs, missing imports, or errors. Output the final corrected versions of any files that need fixing.'
  - Final node MUST be 'Finalize'. Instruction: 'Prepare the final list of artifacts for the ZIP download.'
  
  Return ONLY JSON:
  {
    "nodes": [
      { "id": "1", "label": "Structure", "instruction": "Define file structure..." }
    ],
    "edges": [
      { "source": "1", "target": "2" }
    ]
  }`;

  const result = await jsonModel.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function executeWorkflowNode(
  nodeLabel: string,
  instruction: string,
  accumulatedContext: string,
  retryCount: number = 0,
  previousResponse?: string,
  previousError?: string,
): Promise<any> {
  console.log(`[AI] Executing Node: ${nodeLabel} (Attempt ${retryCount + 1})`);

  const basePrompt = `Executing Step: ${nodeLabel}
  Instruction: ${instruction}
  
  Accumulated Codebase Context (Files already created):
  ${accumulatedContext || "None"}
  
  Execute the instruction. If you are fixing bugs or generating installers, refer to the context above.
  Return ONLY JSON:
  {
    "artifactName": "filename.ext",
    "artifactContent": "the actual code or text",
    "type": "code" | "json" | "text" | "html" | "css" | "javascript",
    "explanation": "What was done in this step"
  }`;

  let prompt = basePrompt;
  if (retryCount > 0) {
    prompt += `\n\nCRITICAL: Your previous response failed to parse as valid JSON.
    
    FAILED RESPONSE FROM PREVIOUS ATTEMPT:
    ${previousResponse}
    
    PARSING ERROR:
    ${previousError}
    
    PLEASE FIX:
    1. Escape all backslashes properly (e.g., use \\\\ in strings).
    2. Use literal \\n for newlines within strings.
    3. Escape double quotes (\\") inside the artifactContent string.
    4. Ensure the response is a single, valid JSON object.`;
  }

  try {
    const result = await jsonModel.generateContent(prompt);
    const responseText = result.response.text();

    // Attempt to sanitize common JSON issues
    let sanitized = responseText.trim();
    if (sanitized.startsWith("```json"))
      sanitized = sanitized.replace(/^```json/, "").replace(/```$/, "");

    try {
      return JSON.parse(sanitized);
    } catch (parseError: any) {
      if (retryCount < 2) {
        console.warn(
          `[AI] JSON Parse failed for ${nodeLabel}, retrying with failure context...`,
        );
        return executeWorkflowNode(
          nodeLabel,
          instruction,
          accumulatedContext,
          retryCount + 1,
          responseText,
          parseError.message,
        );
      }
      throw new Error(
        `Final JSON Parse Failure: ${parseError.message}\nRaw AI Output: ${responseText}`,
      );
    }
  } catch (error: any) {
    console.error(`[AI] Error in executeWorkflowNode (${nodeLabel}):`, error);
    if (
      retryCount < 2 &&
      !error.message?.includes("404") &&
      !error.message?.includes("JSON")
    ) {
      return executeWorkflowNode(
        nodeLabel,
        instruction,
        accumulatedContext,
        retryCount + 1,
      );
    }
    throw error;
  }
}
