import { test, expect } from "@playwright/test";
import {
	registerRouteMocks,
	mockEmail,
	mockPassword,
} from "../playwright.mocks";

test("login page loads correctly", async ({ page }) => {
	await page.goto("/auth/login");
	await expect(page.locator(".auth-form")).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Forgot password?" })
	).toBeVisible();
	await expect(
		page.locator(".auth-form__footer-link", { hasText: "Sign up" })
	).toBeVisible();
});

test("login form submits correctly", async ({ page, context }) => {
	await registerRouteMocks(context);
	await page.goto("/auth/login");
	await page.waitForLoadState("networkidle");
	await page.getByRole("textbox", { name: "Email" }).fill(mockEmail);
	await page.getByRole("textbox", { name: "Password" }).fill(mockPassword);
	await page.getByRole("button", { name: "Log in" }).click();
	await expect(page).toHaveURL("/");
	await expect(page.getByRole("link", { name: "Notifications" })).toBeVisible();
});
