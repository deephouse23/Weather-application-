async function test_page_load_performance(ctx) {
    const { page, expect } = ctx;

    const start = Date.now();
    await page.goto("https://www.16bitweather.co");
    const loadTime = Date.now() - start;
    
    // Check visible core element
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Performance goal: page should load in under 2.5 seconds
    console.log(`Page loaded in ${loadTime} ms`);
    expect(loadTime).toBeLessThanOrEqual(2500);
}
