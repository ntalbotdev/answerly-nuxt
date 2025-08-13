import { test, expect } from "@playwright/test";

test("header navbar is visible", async ({ page }) => {
	await page.goto("/");
	const navbar = page.locator(".header__nav");
	await expect(navbar).toBeVisible();
});

test("renders auth links for unauthenticated users", async ({ page }) => {
	await page.goto("/");
	const links = page.locator(".header__nav-link");
	await expect(links).toHaveCount(2);
	await expect(links.nth(0)).toHaveAttribute("href", "/auth/login");
	await expect(links.nth(1)).toHaveAttribute("href", "/auth/signup");
});

test.describe(() => {
	test.use({ storageState: "test/e2e/auth.json" });
	test("renders user links for logged in users", async ({ page }) => {
		await page.goto("/");
		const links = page.locator(".header__nav-link");
		await expect(links).toHaveCount(3);
		await expect(links.nth(0)).toHaveAttribute("href", "/");
		await expect(links.nth(1)).toHaveAttribute("href", "/discover");
		await expect(links.nth(2)).toHaveAttribute("href", "/notifications");
	});
});
