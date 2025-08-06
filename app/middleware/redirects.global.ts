export default defineNuxtRouteMiddleware((to) => {
	const user = useSupabaseUser();

	if (user.value && (to.path === "/profile" || to.path === "/profile/")) {
		const profileStore = useProfileStore();

		if (profileStore.myProfile?.username) {
			return navigateTo(
				ROUTES.PROFILE_USER(profileStore.myProfile.username)
			);
		}

		return navigateTo(ROUTES.PROFILE_USER(user.value.id));
	}
});
