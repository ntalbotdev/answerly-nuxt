import { test, expect } from "@playwright/test";

test("user dropdown is not rendered for unauthenticated users", async ({
	page,
}) => {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	const dropdown = page.locator(".header__user-dropdown");
	await expect(dropdown).not.toBeVisible();
});

test.describe("logged in", () => {
	test.use({ storageState: "test/e2e/auth.json" });
	test("renders the user dropdown component", async ({ page }) => {
		await page.goto("/");
		const dropdown = page.locator(".header__user-dropdown");
		await expect(
			dropdown.locator(".header__user-dropdown-avatar")
		).toBeVisible();
	});

	test("shows user avatar and display name", async ({ page }) => {
		await page.goto("/");
		const dropdown = page.locator(".header__user-dropdown");
		await expect(
			dropdown.locator(".header__user-dropdown-avatar")
		).toBeVisible();
		await expect(
			dropdown.locator(".header__user-dropdown-name")
		).toBeVisible();
	});

	test("menu toggles on button click", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const dropdownMenu = page.locator(".header__user-dropdown-menu");
		const button = page.locator(".header__user-dropdown-button");
		await button.click();
		await expect(dropdownMenu).toBeVisible();
		await button.click();
		await expect(dropdownMenu).not.toBeVisible();
	});

	test("menu closes when clicking outside", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const dropdown = page.locator(".header__user-dropdown");
		const dropdownMenu = dropdown.locator(".header__user-dropdown-menu");
		const button = dropdown.locator(".header__user-dropdown-button");
		await button.click();
		await expect(dropdownMenu).toBeVisible();
		await page.click("body");
		await expect(dropdownMenu).not.toBeVisible();
	});

	test("shows links in menu", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const button = page.locator(".header__user-dropdown-button");
		await button.click();
		const dropdownMenu = page.locator(".header__user-dropdown-menu");
		await expect(dropdownMenu.locator("a")).toHaveCount(4);
		await expect(dropdownMenu.locator("a").nth(0)).toHaveAttribute(
			"href",
			"/inbox"
		);
		await expect(dropdownMenu.locator("a").nth(1)).toHaveAttribute(
			"href",
			"/profile/test"
		);
		await expect(dropdownMenu.locator("a").nth(2)).toHaveAttribute(
			"href",
			"/my-questions"
		);
		await expect(dropdownMenu.locator("a").nth(3)).toHaveAttribute(
			"href",
			"/settings"
		);
		await expect(dropdownMenu.locator("button", { hasText: "Logout" }));
	});
});
