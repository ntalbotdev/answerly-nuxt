import { ROUTES } from "~/utils/routes";

export default defineNuxtRouteMiddleware((to, _from) => {
    const user = useSupabaseUser();
    // If logged in, redirect from any auth page to home
    if (
        user.value &&
        to.path.startsWith("/auth")
    ) {
        return navigateTo(ROUTES.HOME);
    }

    // If not logged in, redirect /auth or /auth/ to /auth/login
    if (!user.value && (to.path === "/auth" || to.path === "/auth/")) {
        return navigateTo(ROUTES.LOGIN);
    }
});
