import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
	test: {
		environment: "nuxt",
		environmentOptions: {
			nuxt: {
				mock: {
					intersectionObserver: true,
					indexedDb: true,
				},
				overrides: {
					// Override Nuxt config options for tests
				},
			},
		},
	},
});
