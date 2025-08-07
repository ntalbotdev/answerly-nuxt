<script setup lang="ts">
const user = useSupabaseUser();

watch(
	user,
	() => {
		useHead({
			title: computed(() => {
				return user.value ? "Home" : "Answerly – Ask. Answer. Connect.";
			}),
			...(user.value ? {} : { titleTemplate: null }),
			meta: [
				{
					name: "description",
					content: computed(() => {
						return user.value
							? "Welcome back to Answerly! Unleash your curiosity."
							: "Welcome to Answerly! A platform for asking and answering questions.";
					}),
				},
			],
		});
	},
	{ immediate: true }
);
</script>

<template>
	<div class="home">
		<template v-if="!user">
			<WelcomeComponent />
		</template>

		<template v-else-if="user"> feed component todo </template>
	</div>
</template>
