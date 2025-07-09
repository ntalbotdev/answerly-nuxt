// This middleware redirects logged-in users away from /auth pages
export default defineNuxtRouteMiddleware((to, _from) => {
    const user = useSupabaseUser();
    const authRootPaths = ["/auth", "/auth/"];
    const authPages = ["/auth", "/auth/", "/auth/login", "/auth/signup"];

    // If logged in, redirect from any auth page to /
    if (user.value && authPages.includes(to.path)) {
        return navigateTo("/");
    }

    // If not logged in, redirect /auth or /auth/ to /auth/login
    if (!user.value && authRootPaths.includes(to.path)) {
        return navigateTo("/auth/login");
    }
});
