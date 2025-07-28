import { defineNuxtConfig } from "nuxt/config";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-05-15",
	devtools: { enabled: true },
	modules: [
		"@nuxt/eslint",
		"@nuxtjs/supabase",
		"@pinia/nuxt",
		"@nuxtjs/tailwindcss",
		"@nuxt/icon",
		"@nuxt/test-utils/module",
	],
	css: ["~/assets/css/global.scss"],
	supabase: {
		url: process.env.SUPABASE_URL,
		key: process.env.SUPABASE_ANON_KEY,
		redirect: false,
		redirectOptions: {
			login: "/auth/login",
			callback: "/auth/confirm",
		},
	},
});
