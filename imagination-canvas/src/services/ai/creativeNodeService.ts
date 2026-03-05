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
    case "translator":
      return {
        result: `[${String(inputs.targetLanguage ?? "English")}] ${String(inputs.source ?? "")}`,
      };
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
