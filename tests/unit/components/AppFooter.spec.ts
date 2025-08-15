import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppFooter from "@/components/AppFooter.vue";
import { GITHUB_URL } from "@/utils/constants";

describe("AppFooter", () => {
	it("renders correctly", () => {
		const component = mount(AppFooter);
		expect(component.exists()).toBe(true);
	});

	it("displays the correct copyright year", () => {
		const component = mount(AppFooter);
		const year = new Date().getFullYear();
		expect(component.find(".footer__copyright").text()).toContain(year);
	});

	it("displays the correct GitHub link", () => {
		const component = mount(AppFooter);
		expect(component.find(".footer__link").attributes("href")).toBe(
			GITHUB_URL
		);
	});
});
