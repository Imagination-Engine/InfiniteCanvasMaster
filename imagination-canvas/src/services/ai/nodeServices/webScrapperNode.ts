import { apiRequest } from "../../../lib/api";
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

    return response;
  } catch (error) {
    console.error("Web Scraper Node Error:", error);
    return {
      summary: {
        url: url,
        title: "Error Scraping Page",
        bullets: [`Error: ${error instanceof Error ? error.message : "Unknown error"}`],
      },
    };
  }
}

