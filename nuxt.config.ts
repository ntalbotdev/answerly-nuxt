// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-05-15",
    devtools: { enabled: true },
    modules: [
        "@nuxt/ui",
        "@nuxt/image",
        "@nuxt/icon",
        "@nuxt/fonts",
        "@nuxt/eslint",
        "@nuxt/scripts",
        "@nuxt/test-utils",
        "@nuxtjs/supabase",
        "@pinia/nuxt",
    ],
    css: [
        '~/assets/global.css',
    ],
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