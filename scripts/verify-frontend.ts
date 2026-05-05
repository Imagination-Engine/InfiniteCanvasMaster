import { chromium } from "playwright";

async function run() {
  console.log("Launching browser to trace frontend errors...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let errors: string[] = [];

  page.on("pageerror", (exception) => {
    console.error(`[PAGE ERROR] ${exception}`);
    errors.push(exception.toString());
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`[CONSOLE ERROR] ${msg.text()}`);
      // Only push non-network errors to the main error list so we don't double-count
      if (
        !msg
          .text()
          .includes(
            "Failed to load resource: the server responded with a status of 500",
          )
      ) {
        errors.push(msg.text());
      }
    }
  });

  page.on("requestfailed", (request) => {
    console.error(
      `[NETWORK ERROR] ${request.url()} - ${request.failure()?.errorText}`,
    );
    errors.push(`Network error on ${request.url()}`);
  });

  page.on("response", async (response) => {
    if (!response.ok()) {
      const url = response.url();
      if (url.includes("localhost:5173") && !url.includes("/api/")) {
        console.error(
          `[HTTP ERROR] ${response.status()} ${response.statusText()} on ${url}`,
        );
        const text = await response.text();
        console.error(`Response body: ${text.slice(0, 500)}...`);
        errors.push(`HTTP ${response.status()} on ${url}`);
      } else if (url.includes("/api/")) {
        console.error(`[API ERROR] ${response.status()} on ${url}`);
      }
    }
  });

  try {
    console.log("Navigating to http://localhost:5173/ ...");
    await page.goto("http://localhost:5173/", {
      waitUntil: "networkidle",
      timeout: 10000,
    });
    console.log("Page loaded.");
    await page.waitForTimeout(2000);
  } catch (e: any) {
    console.error("Navigation error:", e.message);
  } finally {
    await browser.close();
    if (errors.length > 0) {
      console.log(`\nFound ${errors.length} frontend errors.`);
      process.exit(1);
    } else {
      console.log("\nNo frontend errors detected!");
      process.exit(0);
    }
  }
}

run();
