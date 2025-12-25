async function test_landing_page_basic_functionality(ctx) {
    const { page, expect } = ctx;
    
    await page.goto("https://www.16bitweather.co");
    
    // Check that main heading is visible (assuming it exists)
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // Make sure page title is correct or contains '16bitweather'
    await expect(page).toHaveTitle(/16bitweather/i);
}
