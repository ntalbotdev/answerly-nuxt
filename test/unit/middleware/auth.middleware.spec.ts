import { describe, it, expect, beforeEach } from "vitest";
import { mockNavigateTo } from "../setup";

describe("Auth middleware", () => {
	let authMiddleware: () => Promise<unknown>;

	beforeEach(async () => {
		mockNavigateTo.mockClear();
		const module = await import("@/middleware/auth");
		authMiddleware = module.default;
	});

	it("does not redirect if user is logged in (default state)", async () => {
		await authMiddleware();
		expect(mockNavigateTo).not.toHaveBeenCalled();
	});
});
