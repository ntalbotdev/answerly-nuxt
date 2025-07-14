import { ROUTES } from "~/utils/routes";

export default defineNuxtRouteMiddleware(() => {
	const user = useSupabaseUser();
	if (!user.value) {
		// If not logged in, redirect to login page
		return navigateTo(ROUTES.LOGIN);
	}
});
