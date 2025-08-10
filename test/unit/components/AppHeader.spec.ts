import { setActivePinia, createPinia } from "pinia";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, it, expect, beforeEach } from "vitest";
import { mockUser } from "../vitest.setup";
import AppHeader from "@/components/AppHeader.vue";

describe("AppHeader", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		mockUser.value = null;
	});

	it("renders only public nav when logged out", async () => {
		mockUser.value = null;
		const component = await mountSuspended(AppHeader);
		expect(component.html()).toContain("Answerly");
		expect(component.find('[data-testid="header-navbar"]').exists()).toBe(
			true
		);
		expect(
			component.find('[data-testid="header-user-dropdown"]').exists()
		).toBe(false);
	});

	it("renders full nav and user dropdown when logged in", async () => {
		mockUser.value = {
			id: "1",
			email: "test@test.com",
			username: "test",
		};
		const component = await mountSuspended(AppHeader);

		expect(component.html()).toContain("Answerly");
		expect(component.find('[data-testid="header-navbar"]').exists()).toBe(
			true
		);
		expect(
			component.find('[data-testid="header-user-dropdown"]').exists()
		).toBe(true);
	});
});
