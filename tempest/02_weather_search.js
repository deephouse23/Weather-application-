async function test_weather_search_basic(ctx) {
    const { page, expect } = ctx;
    await page.goto("https://www.16bitweather.co");
    // Check landing page title is visible as sanity check
    await expect(page).toHaveTitle(/16bit weather/i);
}
