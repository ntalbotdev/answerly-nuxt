export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    // If not logged in, redirect /my to home
    if (!user.value && (to.path === "/my" || to.path === "/my/")) {
        return navigateTo("/");
    }
    // If logged in, redirect /my to /my/profile
    else if (user.value && (to.path === "/my" || to.path === "/my/")) {
        // If logged in, redirect /my to /my/profile
        return navigateTo("/my/profile");
    }
});
