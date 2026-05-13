import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "dummy");

// Standard chat model
const chatModel = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

// JSON-enforced model for workflows
const jsonModel = genAI.getGenerativeModel({
  model: "gemini-3.1-pro-preview",
  generationConfig: { responseMimeType: "application/json" },
});

export async function chatAboutGoal(
  message: string,
  isRefining: boolean = false,
) {
  const systemPrompt = isRefining
    ? "You are a workflow architect. The user is asking you to modify their current workflow. Acknowledge their request briefly."
    : "You are an AI architect. The user wants to build an application or script. Help them define the goal clearly and briefly. Once clear, say 'Let's generate the workflow!'";

  const prompt = `${systemPrompt}\n\nUser: ${message}`;
  const result = await chatModel.generateContent(prompt);
  return result.response.text();
}

export async function generateWorkflowPlan(
  goal: string,
  modifications: string = "",
) {
  const prompt = `You are a workflow planner. The user wants to build: "${goal}".
  ${modifications ? `The user also requested these modifications: "${modifications}".` : ""}
  
  Create a sequence of logical nodes to achieve this. Each node must have an 'id', a 'label', and an 'instruction' detailing what the AI should do during that step.
  Connect them sequentially via 'edges'.
  
  Return ONLY JSON matching this exact schema:
  {
    "nodes": [
      { "id": "1", "label": "Setup Config", "instruction": "Generate the initial configuration..." },
      { "id": "2", "label": "Write Main Logic", "instruction": "Write the core python script..." }
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
  previousContext: string,
) {
  const prompt = `You are executing a step in a software generation workflow.
Step Name: ${nodeLabel}
Instruction: ${instruction}

Context from previous steps:
${previousContext || "None. This is the first step."}

Execute the instruction. If the instruction asks you to generate code, return the code. If it asks for a config file, return the JSON/YAML. If it asks for text, return the text.
Return ONLY JSON matching this exact schema:
{
  "artifactName": "filename.ext",
  "artifactContent": "the actual code, text, or json you generated",
  "type": "code" | "json" | "text"
}`;

  const result = await jsonModel.generateContent(prompt);
  return JSON.parse(result.response.text());
}
