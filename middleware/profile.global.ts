// Redirects for /profile and /my routes
export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();

    // Redirect /profile to home
    if (to.path === "/profile" || to.path === "/profile/") {
        return navigateTo("/");
    }

    // Redirect /my to /my/profile if logged in, else to home
    if (to.path === "/my" || to.path === "/my/") {
        if (user.value) {
            return navigateTo("/my/profile");
        } else {
            return navigateTo("/");
        }
    }

    // Redirect /my/profile to /profile if not logged in
    if (to.path === "/my/profile" || to.path === "/my/profile/") {
        if (!user.value) {
            return navigateTo("/");
        }
    }

    // Redirect /my/profile/edit to / if not logged in
    if (to.path === "/my/profile/edit" || to.path === "/my/profile/edit/") {
        if (!user.value) {
            return navigateTo("/");
        }
    }
});
