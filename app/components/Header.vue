<script setup lang="ts">
const user = useSupabaseUser();
const profileStore = useProfileStore();

// Profile fetch/clear logic remains here for now
watchEffect(async () => {
	if (user.value) {
		if (
			!profileStore.myProfile ||
			profileStore.myProfile.user_id !== user.value.id
		) {
			await profileStore.fetchProfileById(user.value.id);
		}
	} else {
		profileStore.clearProfile();
	}
});
</script>

<template>
	<header class="header">
		<div class="header__inner">
			<div class="header__content">
				<div class="header__logo">
					<NuxtLink :to="ROUTES.HOME">
						<Icon
							name="heroicons:chat-bubble-left-20-solid"
							class="header__logo-icon"
						/>
						Answerly
					</NuxtLink>
				</div>

				<HeaderNavbar />
				<HeaderNavHamburger />
			</div>
		</div>
	</header>
</template>
