import { describe, it, expect, beforeEach } from "vitest";
import { mockUser, mockNavigateTo } from "../setup";

describe("Auth middleware", () => {
	let authMiddleware: () => Promise<unknown>;

	beforeEach(async () => {
		mockUser.value = null;
		mockNavigateTo.mockClear();
		const module = await import("@/middleware/auth");
		authMiddleware = module.default;
	});

	it("allows access if user is logged in", async () => {
		mockUser.value = { id: "1", email: "test@test.com" };
		await authMiddleware();
		expect(mockNavigateTo).not.toHaveBeenCalled();
	});
});
