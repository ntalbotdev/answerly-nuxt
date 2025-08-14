import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import FollowingCount from "@/components/FollowingCount.vue";

describe("FollowingCount", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders following count", async () => {
		const component = mount(FollowingCount, {
			props: { userId: "1" },
		});
		await component.vm.$nextTick();
		await flushPromises();
		expect(component.text()).toContain("17 Following");
	});

	it("shows 0 following if no userId", async () => {
		const component = mount(FollowingCount, {
			props: { userId: "" },
		});
		await component.vm.$nextTick();
		await flushPromises();
		expect(component.text()).toContain("0 Following");
	});
});
