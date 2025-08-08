import { config } from "@vue/test-utils";

config.global.stubs = {
	NuxtLink: {
		template: "<a><slot /></a>",
		props: ["to"],
	},
};
