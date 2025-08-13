import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, it, expect, beforeEach } from "vitest";
import { mockUser } from "../vitest.setup";
import HeaderNavHamburger from "@/components/HeaderNavHamburger.vue";
import { useSupabaseUser } from "#imports";

describe("HeaderNavHamburger", () => {
	beforeEach(() => {
		const user = useSupabaseUser();
		if (user && typeof user === "object" && "$ssupabase_user" in user) {
			user.value = mockUser.value;
		}
	});

	it("renders the component", async () => {
		const component = await mountSuspended(HeaderNavHamburger);
		expect(component.exists()).toBe(true);
	});

	it("showMenu is false on mount", async () => {
		const component = await mountSuspended(HeaderNavHamburger);
		expect(component.vm.showMenu.value).toBe(false);
	});

	it("toggles showMenu on button click", async () => {
		const component = await mountSuspended(HeaderNavHamburger);
		const button = component.find(".header__nav-hamburger-button");
		await button.trigger("click");
		expect(component.vm.showMenu.value).toBe(true);
		expect(component.find(".header__nav-hamburger-menu").exists()).toBe(
			true
		);
		await button.trigger("click");
		expect(component.vm.showMenu.value).toBe(false);
	});

	it("renders auth links when user is logged out", async () => {
		const component = await mountSuspended(HeaderNavHamburger);
		const button = component.find(".header__nav-hamburger-button");
		await button.trigger("click");
		const loginLink = component.find(
			'.header__nav-link[href="/auth/login"]'
		);
		const signupLink = component.find(
			'.header__nav-link[href="/auth/signup"]'
		);

		expect(loginLink.exists()).toBe(true);
		expect(loginLink.text()).toContain("Log in");
		expect(signupLink.exists()).toBe(true);
		expect(signupLink.text()).toContain("Sign up");
	});

	it("renders all links when user is logged in", async () => {
		const component = await mountSuspended(HeaderNavHamburger);
		component.vm.user.value = {
			id: "1",
			email: "test@test.com",
			username: "test",
		};
		const button = component.find(".header__nav-hamburger-button");
		await button.trigger("click");
		const loginLink = component.find(
			'.header__nav-link[href="/auth/login"]'
		);
		const logoutLink = component.find('[data-testid="logout-button"]');
		expect(loginLink.exists()).toBe(false);
		expect(logoutLink.exists()).toBe(true);
		expect(logoutLink.text()).toContain("Logout");
	});
});
