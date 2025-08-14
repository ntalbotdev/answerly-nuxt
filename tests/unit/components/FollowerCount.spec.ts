import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import FollowerCount from "@/components/FollowerCount.vue";
import { fetchFollowerCount } from "@/composables/useFollow";

describe("FollowerCount", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders follower count", async () => {
		const component = mount(FollowerCount, {
			props: { userId: "1" },
		});
		await component.vm.$nextTick();
		await flushPromises();
		expect(component.text()).toContain("42 Followers");
	});

	it("shows 1 follower if user has one follower", async () => {
		vi.mocked(fetchFollowerCount).mockResolvedValueOnce(1);
		const component = mount(FollowerCount, {
			props: { userId: "1" },
		});
		await component.vm.$nextTick();
		await flushPromises();
		expect(component.text()).toContain("1 Follower");
	});

	it("shows 0 followers if no userId", async () => {
		const component = mount(FollowerCount, {
			props: { userId: "" },
		});
		await component.vm.$nextTick();
		await flushPromises();
		expect(component.text()).toContain("0 Followers");
	});
});
