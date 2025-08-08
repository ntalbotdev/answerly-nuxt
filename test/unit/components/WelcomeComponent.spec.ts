import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import WelcomeComponent from "@/components/WelcomeComponent.vue";

describe("WelcomeComponent", () => {
	it("renders the main title", () => {
		const wrapper = mount(WelcomeComponent);
		expect(wrapper.text()).toContain("Answer.");
	});

	it("renders the slogan", () => {
		const wrapper = mount(WelcomeComponent);
		expect(wrapper.text()).toContain("curiosity");
	});

	it("has a log in button linking to login", () => {
		const wrapper = mount(WelcomeComponent);
		const login = wrapper.find('a[href="/auth/login"]');
		expect(login.exists()).toBe(true);
	});

	it("has a sign up button linking to signup", () => {
		const wrapper = mount(WelcomeComponent);
		const signup = wrapper.find('a[href="/auth/signup"]');
		expect(signup.exists()).toBe(true);
	});
});
