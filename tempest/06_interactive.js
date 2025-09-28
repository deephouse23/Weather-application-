async function test_buttons_basic(ctx) {
  const { page, expect } = ctx;
  await page.goto('https://www.16bitweather.co');
  await expect(page.getByRole('button')).toBeVisible();
}
