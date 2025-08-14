import { test, expect } from "@playwright/test";

test("user dropdown is not rendered for unauthenticated users", async ({
	page,
}) => {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	const dropdown = page.locator(".header__user-dropdown");

	await expect(dropdown).toBeHidden();
});

test.describe("logged in", () => {
	test.use({ storageState: "tests/e2e/auth.json" });
	test("renders the user dropdown component", async ({ page }) => {
		await page.goto("/");
		const dropdown = page.locator(".header__user-dropdown");

		await expect(
			dropdown.locator(".header__user-dropdown-avatar")
		).toBeVisible();
	});

	test("shows user avatar and display name", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
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
		const dropdownButton = page.locator(".header__user-dropdown-button");

		await dropdownButton.click();
		await expect(dropdownMenu).toBeVisible();
		await dropdownButton.click();
		await expect(dropdownMenu).toBeHidden();
	});

	test("menu closes when clicking outside", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const dropdown = page.locator(".header__user-dropdown");
		const dropdownMenu = dropdown.locator(".header__user-dropdown-menu");
		const dropdownButton = dropdown.locator(
			".header__user-dropdown-button"
		);

		await dropdownButton.click();
		await expect(dropdownMenu).toBeVisible();
		await page.click("body");
		await expect(dropdownMenu).toBeHidden();
	});

	test("shows links in menu", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const dropdownButton = page.locator(".header__user-dropdown-button");
		const dropdownMenu = page.locator(".header__user-dropdown-menu");
		const dropdownLink = dropdownMenu.locator(
			".header__user-dropdown-link"
		);
		const expectedHrefs = [
			"/inbox",
			"/profile/test",
			"/my-questions",
			"/settings",
		];

		await dropdownButton.click();
		await expect(dropdownLink).toHaveCount(4);
		for (let i = 0; i < expectedHrefs.length; i++) {
			await expect(dropdownLink.nth(i)).toHaveAttribute(
				"href",
				expectedHrefs[i]
			);
		}
		await expect(
			dropdownMenu.locator("button", { hasText: "Logout" })
		).toBeVisible();
	});
});
