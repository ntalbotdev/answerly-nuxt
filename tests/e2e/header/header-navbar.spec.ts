import { test, expect } from "@playwright/test";

test("header navbar is visible", async ({ page }) => {
	await page.goto("/");
	const navbar = page.locator(".header__nav");
	await expect(navbar).toBeVisible();
});

test("renders auth links for unauthenticated users", async ({ page }) => {
	await page.goto("/");
	const links = page.locator(".header__nav-link");
	expect(links).toHaveCount(2);
	expect(links.nth(0)).toHaveAttribute("href", "/auth/login");
	expect(links.nth(1)).toHaveAttribute("href", "/auth/signup");
});

test.describe("logged in", () => {
	test.use({ storageState: "test/e2e/auth.json" });
	test("renders nav links", async ({ page }) => {
		await page.goto("/");
		const links = page.locator(".header__nav-link");
		await expect(links).toHaveCount(3);
		await expect(links.nth(0)).toHaveAttribute("href", "/");
		await expect(links.nth(1)).toHaveAttribute("href", "/discover");
		await expect(links.nth(2)).toHaveAttribute("href", "/notifications");
	});

	test("toggles active class on nav links", async ({ page }) => {
		await page.goto("/");
		const homeLink = page.locator('.header__nav-link[href="/"]');
		const notificationsLink = page.locator(
			'.header__nav-link[href="/notifications"]'
		);
		await expect(homeLink).toHaveClass(/--active/);

		await notificationsLink.click();
		await expect(page).toHaveURL("/notifications");
		await expect(notificationsLink).toHaveClass(/--active/);
		await expect(homeLink).not.toHaveClass(/--active/);
	});
});
