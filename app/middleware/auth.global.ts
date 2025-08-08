export default defineNuxtRouteMiddleware((to, _from) => {
	const user = useSupabaseUser();
	if (user.value && to.path.startsWith("/auth")) {
		return navigateTo(ROUTES.HOME);
	}

	if (!user.value && (to.path === "/auth" || to.path === "/auth/")) {
		return navigateTo(ROUTES.HOME);
	}
});
