import webScraper from "./nodeServices/webScrapperNode";



const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runCreativeNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  config: Record<string, unknown>,
  accessToken?: string | null,
): Promise<Record<string, unknown>> {
  await sleep(300);

  switch (nodeType) {
    case "summarizer": {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
        if (!apiKey) {
          throw new Error("VITE_GOOGLE_API_KEY is not defined in the environment.");
        }

        const sourcesRaw = inputs.sources ?? inputs.source;
        let sources: string[] = [];

        if (Array.isArray(sourcesRaw)) {
          sources = sourcesRaw.map((value) => String(value)).filter(Boolean);
        } else if (sourcesRaw && typeof sourcesRaw === "object") {
          const record = sourcesRaw as Record<string, unknown>;
          sources = ["text", "image", "audio"]
            .map((key) => record[key])
            .filter((value): value is unknown => Boolean(value))
            .map((value) => String(value));

          if (sources.length === 0) {
            sources = [JSON.stringify(record)];
          }
        } else {
          const single = String(sourcesRaw ?? "");
          sources = single ? [single] : [];
        }

        if (sources.length === 0) {
          throw new Error("No sources provided to summarize.");
        }

        const additionalInstructions = typeof config.additionalInstructions === "string" 
          ? config.additionalInstructions.trim() 
          : "";

        const parts: any[] = [];
        
        if (additionalInstructions) {
          parts.push({ text: `Additional instructions: ${additionalInstructions}\n\n` });
        }
        
        parts.push({ text: 'Please summarize and analyze the following content. Return ONLY a JSON object with two fields: "summary" (a concise summary) and "analysis" (deeper insights, patterns, or notable points).\n\n' });

        sources.forEach((s, i) => {
          parts.push({ text: `Source ${i + 1}:\n` });
          
          if (s.startsWith("data:image/") || s.startsWith("data:audio/")) {
            // It's a base64 image or audio
            // Format: data:image/png;base64,iVBORw0KGgo...
            // Or: data:audio/mp3;base64,...
            const matches = s.match(/^data:((?:image|audio)\/[a-zA-Z0-9+-]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              parts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2]
                }
              });
              parts.push({ text: "\n\n" });
            } else {
              parts.push({ text: "[Invalid Media Data]\n\n" });
            }
          } else {
            // It's text
            parts.push({ text: `${s}\n\n` });
          }
        });

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: parts
              }]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        let cleanJsonText = textResponse;
        
        const jsonBlockMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
          cleanJsonText = jsonBlockMatch[1];
        } else {
          const firstBrace = textResponse.indexOf('{');
          const lastBrace = textResponse.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanJsonText = textResponse.substring(firstBrace, lastBrace + 1);
          }
        }
        
        const parsed = JSON.parse(cleanJsonText);
        
        return {
          summary: parsed.summary || "Summarization failed",
          analysis: parsed.analysis || "Analysis failed",
        };
      } catch (error) {
        console.error("Summarizer error:", error);
        return {
          summary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          analysis: "Error",
        };
      }
    }
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
      return webScraper({ url: String(inputs.url ?? "") }, accessToken);
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
