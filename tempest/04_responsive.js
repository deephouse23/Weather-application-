async function test_responsive_design_homepage(ctx) {
    const { page, expect } = ctx;

    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("https://www.16bitweather.co");
    await expect(page).toHaveURL(/16bitweather/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}
