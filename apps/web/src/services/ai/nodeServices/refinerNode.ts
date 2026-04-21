import { apiRequest } from "../../../lib/api";

const formatRefinedAsText = (refined: string) => {
  return refined;
};

export default async function refinerNode(
  inputs: { source: string },
  config: { style: string },
  accessToken?: string | null
) {
  try {
    const text = inputs.source;
    const style = config.style || "Formal";

    const response = await apiRequest<{ refinedText: string }>(
      "/api/refineText",
      {
        method: "POST",
        body: JSON.stringify({ text, style }),
      },
      accessToken
    );

    return {
      refined: response.refinedText,
      text: formatRefinedAsText(response.refinedText),
    };
  } catch (error) {
    console.error("Refiner Node Error:", error);
    return {
      refined: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
