export default defineNuxtRouteMiddleware((to) => {
	const user = useSupabaseUser();

	if (user.value && (to.path === "/profile" || to.path === "/profile/")) {
		const username = user.value.user_metadata?.username || user.value.id;
		return navigateTo(`/profile/${username}`);
	}
});
