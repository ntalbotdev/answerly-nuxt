import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import WelcomeComponent from "@/components/WelcomeComponent.vue";

describe("WelcomeComponent", () => {
	it("renders the main title", () => {
		const component = mount(WelcomeComponent);
		expect(component.text()).toContain("Answer.");
	});

	it("renders the slogan", () => {
		const component = mount(WelcomeComponent);
		expect(component.text()).toContain("curiosity");
	});

	it("has a log in button linking to login", () => {
		const component = mount(WelcomeComponent);
		const login = component.find('a[href="/auth/login"]');
		expect(login.exists()).toBe(true);
	});

	it("has a sign up button linking to signup", () => {
		const component = mount(WelcomeComponent);
		const signup = component.find('a[href="/auth/signup"]');
		expect(signup.exists()).toBe(true);
	});
});
