import { apiRequest } from "../../../lib/api";

const formatSummaryAsText = (summary: { url: string; title: string; bullets: string[] }) => {
  const bulletLines = summary.bullets.map((bullet) => `- ${bullet}`).join("\n");
  return [`Title: ${summary.title}`, `URL: ${summary.url}`, bulletLines].filter(Boolean).join("\n");
};

export default async function webScraper({url}: {url: string}, accessToken?: string | null){
  try {
    // Call the backend API instead of scraping in the frontend
    const response = await apiRequest<{
      summary: {
        url: string;
        title: string;
        bullets: string[];
      };
    }>("/api/scrape", {
      method: "POST",
      body: JSON.stringify({ url }),
    }, accessToken);

    return {
      ...response,
      text: formatSummaryAsText(response.summary),
    };
  } catch (error) {
    console.error("Web Scraper Node Error:", error);
    const summary = {
      summary: {
        url: url,
        title: "Error Scraping Page",
        bullets: [`Error: ${error instanceof Error ? error.message : "Unknown error"}`],
      },
    };

    return {
      ...summary,
      text: formatSummaryAsText(summary.summary),
    };
  }
}
