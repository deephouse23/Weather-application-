async function test_accessibility_landmarks(ctx) {
    const { page, expect } = ctx;
    await page.goto("https://www.16bitweather.co");

    // The main landmark should be present
    const main = page.getByRole("main");
    await expect(main).toBeVisible();
}
