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
      "Use Python (Tkinter/PyQt) or Electron. Provide clear instructions for running locally.",
    CLI: "Use Python. Include a requirements.txt and an OS-neutral install.py script that sets up a venv and adds the tool to PATH.",
    UNKNOWN: "",
  };

  const prompt = `You are a workflow planner for a ${appType} application.
  Goal: "${goal}"
  ${modifications ? `Modifications: "${modifications}"` : ""}
  ${typeSpecificInstructions[appType]}
  
  Create a sequence of logical nodes. Each node takes the previous node's output as 'input' (except the first).
  Nodes should have:
  - id: unique string
  - label: short name
  - instruction: what the AI should generate here.
  
  Final node MUST be a 'Package/Finalize' step that prepares everything for download or preview.
  
  Return ONLY JSON:
  {
    "nodes": [
      { "id": "1", "label": "Structure", "instruction": "Define file structure..." },
      { "id": "2", "label": "Code", "instruction": "Write main logic..." }
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
  input: string,
  retryCount: number = 0,
): Promise<any> {
  console.log(`[AI] Executing Node: ${nodeLabel} (Attempt ${retryCount + 1})`);

  const basePrompt = `Executing Step: ${nodeLabel}
  Instruction: ${instruction}
  Input/Context from previous step: ${input || "None"}
  
  Perform the task. If generating code/files, provide the content.
  Return ONLY JSON:
  {
    "artifactName": "filename.ext",
    "artifactContent": "the actual code or text",
    "type": "code" | "json" | "text" | "html" | "css" | "javascript",
    "explanation": "What was done in this step"
  }`;

  const prompt =
    retryCount > 0
      ? `${basePrompt}\n\nIMPORTANT: Your previous response failed to parse as valid JSON. Ensure all backslashes are escaped (\\\\), newlines are represented as \\n, and quotes inside strings are escaped (\\").`
      : basePrompt;

  try {
    const result = await jsonModel.generateContent(prompt);
    const responseText = result.response.text();

    // Attempt to sanitize common JSON issues (like backticks or raw newlines in strings)
    let sanitized = responseText.trim();
    if (sanitized.startsWith("```json"))
      sanitized = sanitized.replace(/^```json/, "").replace(/```$/, "");

    try {
      return JSON.parse(sanitized);
    } catch (parseError) {
      if (retryCount < 2) {
        console.warn(`[AI] JSON Parse failed for ${nodeLabel}, retrying...`);
        return executeWorkflowNode(
          nodeLabel,
          instruction,
          input,
          retryCount + 1,
        );
      }
      throw parseError;
    }
  } catch (error: any) {
    console.error(`[AI] Error in executeWorkflowNode (${nodeLabel}):`, error);
    if (retryCount < 2 && !error.message?.includes("404")) {
      return executeWorkflowNode(nodeLabel, instruction, input, retryCount + 1);
    }
    throw error;
  }
}
