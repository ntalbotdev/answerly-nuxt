import { config } from "@vue/test-utils";

config.global.stubs = {
	NuxtLink: {
		template: '<a :href="to"><slot /></a>',
		props: ["to"],
	},
};
