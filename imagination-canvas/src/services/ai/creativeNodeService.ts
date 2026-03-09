const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runCreativeNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await sleep(300);

  const instructions = typeof config.additionalInstructions === "string"
    ? config.additionalInstructions.trim()
    : "";

  switch (nodeType) {
    case "summarizer":
      return {
        summary: `Summary for input: ${String(inputs.source ?? "")}`,
        analysis: instructions ? `Analysis with instructions: ${instructions}` : "Basic analysis placeholder.",
      };
    case "translator": {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
        if (!apiKey) {
          throw new Error("VITE_GOOGLE_API_KEY is not defined in the environment.");
        }

        const source = String(inputs.source ?? "");
        const targetLanguage = String(inputs.targetLanguage ?? "English");

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Detect the language of the following text and translate it to ${targetLanguage}.\nReturn ONLY a JSON object with two fields: "detectedLanguage" (the name of the source language) and "translation" (the translated text).\n\nText: ${source}`
                }]
              }]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        // Use a more robust regex to extract JSON anywhere in the response
        let cleanJsonText = textResponse;
        
        // First try to match anything inside ```json ... ``` blocks
        const jsonBlockMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          cleanJsonText = jsonBlockMatch[1];
        } else {
          // If no markdown block, try to find the first { and last }
          const firstBrace = textResponse.indexOf('{');
          const lastBrace = textResponse.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanJsonText = textResponse.substring(firstBrace, lastBrace + 1);
          }
        }
        
        const parsed = JSON.parse(cleanJsonText);
        
        return {
          result: parsed.translation || "Translation failed",
          detectedLanguage: parsed.detectedLanguage || "Unknown",
        };
      } catch (error) {
        console.error("Translation error:", error);
        return {
          result: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          detectedLanguage: "Error",
        };
      }
    }
    case "refiner":
      return {
        refined: `Refined (${String(inputs.mode ?? "text")}): ${String(inputs.source ?? "")}`,
      };
    case "colorSwapper":
      return {
        image: "mock://color-swapped-image",
      };
    case "filter":
      return {
        filtered: `Filtered result for ${String(inputs.conditions ?? "")}`,
      };
    case "webScraper":
      return {
        summary: {
          url: String(inputs.url ?? ""),
          title: "Mock page title",
          bullets: ["Mock insight A", "Mock insight B"],
        },
      };
    case "formatter":
      return {
        formattedFile: `mock://formatted-file.${String(inputs.desiredFormat ?? "txt")}`,
      };
    case "programmer":
      return {
        generatedCode: `// Generated mock code\nfunction run(){\n  return ${JSON.stringify(String(inputs.prompt ?? ""))};\n}`,
      };
    default:
      return {
        result: "No creative mock implementation available for this node.",
      };
  }
}
