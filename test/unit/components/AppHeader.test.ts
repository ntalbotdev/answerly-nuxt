import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import AppHeader from "~/components/AppHeader.vue";

describe("AppHeader", async () => {
	it("should render the AppHeader component and contains 'Answerly'", async () => {
		const component = await mountSuspended(AppHeader);
		expect(component.html()).toContain("Answerly");
	});
});
