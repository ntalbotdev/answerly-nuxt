import { test, expect } from "@playwright/test";

test("login page loads correctly", async ({ page }) => {
	await page.goto("auth/login");
	await page.pause();

	await expect(
		page.getByRole("link", { name: "Forgot password?" })
	).toBeVisible();
	await expect(
		page.locator(".auth-form__footer-link", { hasText: "Sign up" })
	).toBeVisible();
});

test("login form submits correctly", async ({ page }) => {
	await page.goto("auth/login");
	await page.waitForLoadState("networkidle");
	await page.pause();

	await page.getByRole("textbox", { name: "Email" }).fill("test@test.com");
	await page.getByRole("textbox", { name: "Password" }).fill("test123");
	await page.getByRole("button", { name: "Log in" }).click();
	await page.pause();

	await expect(page).toHaveURL("/");

	await expect(
		page.getByRole("link", { name: "Notifications" })
	).toBeVisible();
});
