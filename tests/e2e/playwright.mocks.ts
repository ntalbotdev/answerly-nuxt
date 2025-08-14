export const mockUserId = "00000000-0000-0000-0000-000000000000";
export const mockEmail = "test@testing.com";
export const mockPassword = "test123";
export const mockUsername = "test";
export const mockDisplayName = "Test User";

export const mockSupabaseUser = {
	id: mockUserId,
	email: mockEmail,
	username: mockUsername,
};

export const mockSupabaseSession = {
	access_token: "test-access-token",
	refresh_token: "test-refresh-token",
	user: mockSupabaseUser,
};

export async function registerRouteMocks(
	context: import("@playwright/test").BrowserContext
) {
	// Mock signup
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
	// Mock login
	await context.route("**/auth/v1/token**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				...mockSupabaseSession,
				token_type: "bearer",
				expires_in: 3600,
			}),
		});
	});
	// Mock forgot password
	await context.route("**/auth/v1/recover**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({}),
		});
	});
	// Mock profile creation
	await context.route("**/rest/v1/profiles**", async (route) => {
		await route.fulfill({
			status: 201,
			contentType: "application/json",
			body: JSON.stringify([
				{
					...mockSupabaseUser,
					display_name: mockDisplayName,
				},
			]),
		});
	});
}
