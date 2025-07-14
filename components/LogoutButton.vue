<script setup>
import { useProfileStore } from "~/stores/profile";
import { ROUTES } from "~/utils/routes";

const profileStore = useProfileStore();
const router = useRouter();

const logout = async () => {
	const supabase = useSupabaseClient();
	await supabase.auth.signOut();
	profileStore.clearProfile();
	router.push(ROUTES.LOGIN);
};
</script>

<template>
	<button
		class="header__logout-link"
		@click="
			async () => {
				await logout();
				handleDropdownLinkClick();
			}
		"
	>
		<Icon name="bx:log-out" class="header__logout-link-icon" />
		Logout
	</button>
</template>
