async function test_navigation_menu(ctx) {
    const { page, expect } = ctx;
    await page.goto("https://www.16bitweather.co");
    // Check for the presence of a navigation/menu bar
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
}
