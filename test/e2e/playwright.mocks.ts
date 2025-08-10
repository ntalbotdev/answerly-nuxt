export const mockUserId = "00000000-0000-0000-0000-000000000000";
export const mockEmail = "test@testing.com";
export const mockPassword = "test123";
export const mockUsername = "test";
export const mockDisplayName = "Test User";

export async function registerRouteMocks(
	context: import("@playwright/test").BrowserContext
) {
	await context.route("**/auth/v1/signup**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				user: { id: mockUserId, email: mockEmail },
				session: null,
			}),
		});
	});
	await context.route("**/rest/v1/profiles**", async (route) => {
		await route.fulfill({
			status: 201,
			contentType: "application/json",
			body: JSON.stringify([
				{
					user_id: mockUserId,
					username: mockUsername,
					display_name: mockDisplayName,
				},
			]),
		});
	});
}
