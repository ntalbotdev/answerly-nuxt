import { test, expect } from "@playwright/test";
import { registerRouteMocks, mockEmail } from "../playwright.mocks";

test("forgot password page loads correctly", async ({ page }) => {
	await page.goto("/auth/forgot-password");
	await expect(page.locator(".auth-form")).toBeVisible();
	await expect(
		page.locator(".auth-form__footer-link", { hasText: "Log in" })
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Send reset link" })
	).toBeVisible();
});

test("forgot password form submits correctly", async ({ page, context }) => {
	await registerRouteMocks(context);
	await page.goto("/auth/forgot-password");
	await page.waitForLoadState("networkidle");
	await page.getByRole("textbox").fill(mockEmail);
	await page.getByRole("button", { name: "Send reset link" }).click();
	await expect(page.locator(".auth-form__message")).toBeVisible();
});
