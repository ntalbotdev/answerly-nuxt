<script setup lang="ts">
const profileStore = useProfileStore();
const router = useRouter();
const route = useRoute();
const user = useSupabaseUser();

onMounted(() => {
	profileStore.fetchProfileByUsername(route.params.username as string);
});

watch(
	() => route.params.username,
	(newUsername) => {
		if (typeof newUsername === "string") {
			profileStore.fetchProfileByUsername(newUsername);
		}
	}
);

useHead({
	title: "Profile",
	meta: [{ name: "description", content: "View user profile and details." }],
});

async function refreshProfile() {
	if (profileStore.publicProfile?.username) {
		await profileStore.fetchProfileByUsername(
			profileStore.publicProfile.username
		);
		profileStore.publicProfile = { ...profileStore.publicProfile };
	}
}
</script>

<template>
	<div class="profile-wrapper">
		<template v-if="profileStore.loading">
			<div class="loading-text">Loading...</div>
		</template>

		<template v-else-if="profileStore.error">
			<div class="error-text">{{ profileStore.error }}</div>
		</template>

		<template v-else-if="profileStore.publicProfile">
			<UserProfile
				:profile="profileStore.publicProfile"
				@profile-updated="refreshProfile"
			>
				<template #mutual-status>
					<MutualFollowStatus
						v-if="
							user &&
							user.id !== profileStore.publicProfile.user_id
						"
						:target-user-id="profileStore.publicProfile.user_id"
					/>
				</template>
			</UserProfile>

			<UserQuestions
				:user-id="profileStore.publicProfile.user_id"
				:profile="profileStore.publicProfile"
			/>
		</template>
	</div>
</template>
