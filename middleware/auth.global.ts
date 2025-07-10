// This middleware redirects logged-in users away from /auth pages
export default defineNuxtRouteMiddleware((to, _from) => {
    const user = useSupabaseUser();
    // If logged in, redirect from any auth page to / except /auth/confirm
    if (
        user.value &&
        to.path.startsWith("/auth") &&
        to.path !== "/auth/confirm"
    ) {
        return navigateTo("/");
    }

    // If not logged in, redirect /auth or /auth/ to /auth/login
    if (!user.value && (to.path === "/auth" || to.path === "/auth/")) {
        return navigateTo("/auth/login");
    }
});
