import { test, expect } from "@playwright/test";

test("nav hamburger is hidden on viewport width >= 768px", async ({ page }) => {
	await page.goto("/");
	await page.setViewportSize({ width: 768, height: 800 });
	await expect(page.locator(".header__nav-hamburger")).toBeHidden();
});

test.describe("viewport width < 768px", () => {
	test.use({ viewport: { width: 767, height: 800 } });
	test("renders nav hamburger", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator(".header__nav-hamburger")).toBeVisible();
	});

	test("nav hamburger button toggles menu", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const hamburgerButton = page.locator(".header__nav-hamburger-button");

		await expect(hamburgerButton).toBeVisible();
		await hamburgerButton.click();
		await expect(page.locator(".header__nav-hamburger-menu")).toBeVisible();
		await expect(
			page.locator(".header__nav-hamburger-close")
		).toBeVisible();
		await page.locator(".header__nav-hamburger-close").click();
		await expect(page.locator(".header__nav-hamburger-menu")).toBeHidden();
	});

	test("renders auth links for unauthenticated users", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const hamburgerMenu = page.locator(".header__nav-hamburger-menu");
		const authLinks = hamburgerMenu.locator("a");

		await page.locator(".header__nav-hamburger-button").click();
		await expect(authLinks).toHaveCount(2);
		await expect(authLinks.nth(0)).toHaveAttribute("href", "/auth/login");
		await expect(authLinks.nth(1)).toHaveAttribute("href", "/auth/signup");
	});
});

test.describe("logged in", () => {
	test.use({
		viewport: { width: 767, height: 800 },
		storageState: "tests/e2e/auth.json",
	});
	test("renders nav hamburger", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await expect(page.locator(".header__nav-hamburger")).toBeVisible();
	});

	test("renders nav links", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const hamburgerMenu = page.locator(".header__nav-hamburger-menu");
		const hamburgerButton = page.locator(".header__nav-hamburger-button");
		const navLink = hamburgerMenu.locator(".header__nav-link");
		const expectedHrefs = [
			"/",
			"/discover",
			"/notifications",
			"/inbox",
			"/profile/test",
			"/my-questions",
			"/settings",
		];

		await hamburgerButton.click();
		await expect(navLink).toHaveCount(7);
		for (let i = 0; i < expectedHrefs.length; i++) {
			await expect(navLink.nth(i)).toHaveAttribute(
				"href",
				expectedHrefs[i]
			);
		}
		await expect(
			hamburgerMenu.locator("button", { hasText: "Logout" })
		).toBeVisible();
	});

	test("toggles active class on nav links", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		const hamburgerButton = page.locator(".header__nav-hamburger-button");
		const hamburgerMenu = page.locator(".header__nav-hamburger-menu");
		const homeLink = hamburgerMenu.locator('.header__nav-link[href="/"]');
		const notificationsLink = hamburgerMenu.locator(
			'.header__nav-link[href="/notifications"]'
		);

		await hamburgerButton.click();
		await expect(homeLink).toHaveClass(/--active/);
		await notificationsLink.click();
		await expect(page).toHaveURL("/notifications");
		await hamburgerButton.click();
		await expect(notificationsLink).toHaveClass(/--active/);
		await expect(homeLink).not.toHaveClass(/--active/);
	});
});
