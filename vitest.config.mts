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
			},
		},
		include: ["./tests/unit/**/*.spec.ts"],
		setupFiles: ["./tests/unit/vitest.setup.ts"],
	},
});
