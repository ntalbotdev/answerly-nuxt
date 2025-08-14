import { test, expect } from "@playwright/test";

test("header logo is visible", async ({ page }) => {
	await page.goto("/");
	const logo = page.locator(".header__logo");
	await expect(logo).toBeVisible();
});
