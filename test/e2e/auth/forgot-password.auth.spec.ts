import { test, expect } from "@playwright/test";

test("forgot password page loads correctly", async ({ page }) => {
	await page.goto("auth/forgot-password");
	await page.pause();

	await expect(page.locator(".auth-form")).toBeVisible();
	await expect(
		page.locator(".auth-form__footer-link", { hasText: "Log in" })
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Send reset link" })
	).toBeVisible();
});

test("forgot password form submits correctly", async ({ page }) => {
	await page.goto("auth/forgot-password");
	await page.waitForLoadState("networkidle");
	await page.pause();

	await page.getByRole("textbox").fill("test@testing.com");
	await page.getByRole("button", { name: "Send reset link" }).click();
	await page.pause();

	await expect(page.locator(".auth-form__message")).toBeVisible();
});
