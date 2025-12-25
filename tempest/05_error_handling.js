async function test_error_handling_for_invalid_inputs(ctx) {
    const { page, expect } = ctx;

    // Visit the homepage
    await page.goto("https://www.16bitweather.co");

    // Try to submit an empty search or input an invalid/non-city text and submit
    await page.getByRole("button", { name: /search/i }).click();

    // Look for error message or validation feedback
    await expect(page.locator("text=/invalid|not found|please enter|error/i")).toBeVisible();
}
