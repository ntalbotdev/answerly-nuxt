import { test, expect } from "@playwright/test";
import {
	registerRouteMocks,
	mockEmail,
	mockUsername,
	mockPassword,
} from "../playwright.mocks";

test("sign up page loads correctly", async ({ page }) => {
	await page.goto("/auth/signup");
	await expect(page.locator(".auth-form")).toBeVisible();
	await expect(
		page.locator(".auth-form__footer-link", { hasText: "Log in" })
	).toBeVisible();
});

test("sign up form submits correctly (mock)", async ({ page, context }) => {
	let alertMessage = "";
	page.once("dialog", async (dialog) => {
		alertMessage = dialog.message();
		await dialog.dismiss();
	});
	await registerRouteMocks(context);
	await page.goto("/auth/signup");
	await page.waitForLoadState("networkidle");
	await page.getByRole("textbox", { name: "Email" }).fill(mockEmail);
	await page.getByRole("textbox", { name: "Username" }).fill(mockUsername);
	await page
		.getByRole("textbox", { name: "Password", exact: true })
		.fill(mockPassword);
	await page
		.getByRole("textbox", { name: "Confirm Password" })
		.fill(mockPassword);
	await page.getByRole("button", { name: "Sign up" }).click();
	await page.waitForTimeout(500);
	await expect(alertMessage).toContain("Check your email");
	await expect(page).toHaveURL("/auth/login");
});
