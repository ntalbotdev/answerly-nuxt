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
		include: ["./test/unit/**/*.spec.ts"],
		setupFiles: ["./test/unit/vitest.setup.ts"],
	},
});
