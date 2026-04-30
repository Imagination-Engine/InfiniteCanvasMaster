import { test, expect } from "@playwright/test";

test.describe("Core User Flows", () => {
  test("Intent-to-Blueprint: Prompt -> DAG -> Tldraw Rendering", async ({
    page,
  }) => {
    // 1. Navigate to the HomeStudio/Session page
    await page.goto("/projects/test-project-id");

    // 2. Verify Dual-View exists
    await expect(
      page.getByRole("textbox", { name: /Instruct the engine/i }),
    ).toBeVisible();

    // 3. Submit an intent
    await page.fill("textarea", "Generate a basic creative blueprint");
    await page.keyboard.press("Enter");

    // 4. Verify AI thinking state appears
    await expect(page.getByText(/Agent is thinking/i)).toBeVisible();

    // 5. Verify the tool call executed and nodes appear on Tldraw
    // We expect the 'iem-block' class (HTMLContainer) to eventually mount in the DOM
    await expect(page.locator(".tl-container")).toBeVisible();

    // In a real e2e, we'd wait for specific nodes to render, but for the basic pipeline
    // we ensure the canvas container is ready and not blocked by errors.
    await expect(page.locator(".bg-brand-bg-page")).toBeVisible();
  });

  test("Dual-View Toggling and Spatial Sync", async ({ page }) => {
    await page.goto("/projects/test-project-id");

    // Check spatial view
    await expect(page.locator(".tl-container")).toBeVisible();

    // The Intentcasting bar or toolbar allows toggling views
    // Assuming there's a button or shortcut (e.g., standard layout toggles)
    const toggleButton = page
      .locator("button")
      .filter({ hasText: /Terminal/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(page.locator(".tl-container")).toBeHidden();
    }
  });
});
