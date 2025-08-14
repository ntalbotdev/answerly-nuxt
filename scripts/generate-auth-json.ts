import { chromium } from "@playwright/test";

(async () => {
	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto("http://localhost:3000/auth/login");
	await page.waitForLoadState("networkidle");
	await page.getByRole("textbox", { name: "Email" }).fill("test@test.com");
	await page.getByRole("textbox", { name: "Password" }).fill("test123");
	await page.click('button[type="submit"]');

	await page.waitForURL("http://localhost:3000/");

	await page.context().storageState({ path: "test/e2e/auth.json" });
	await browser.close();
	console.log("✅ auth.json generated at test/e2e/auth.json");
})();
