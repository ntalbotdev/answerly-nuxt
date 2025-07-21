<script setup lang="ts">
const profileStore = useProfileStore();
const router = useRouter();
const route = useRoute();
const user = useSupabaseUser();
const isFollowing = ref(false);
const followerCount = ref(0);

const fetchAndCheckProfile = async (username: string) => {
	await profileStore.fetchProfileByUsername(username);
	if (!profileStore.publicProfile && !profileStore.loading) {
		router.push(ROUTES.HOME);
	} else if (profileStore.publicProfile) {
		// Fetch follower count
		const supabase = useSupabaseClient();
		const { count } = await supabase
			.from("follows")
			.select("follower_id", { count: "exact", head: true })
			.eq("following_id", profileStore.publicProfile.user_id);
		followerCount.value = count || 0;
		// Check follow status after profile is loaded
		if (
			user.value &&
			user.value.id !== profileStore.publicProfile.user_id
		) {
			isFollowing.value = await profileStore.isFollowing(
				profileStore.publicProfile.user_id,
			);
		}
	}
};
onMounted(() => {
	fetchAndCheckProfile(route.params.username as string);
});

watch(
	() => route.params.username,
	(newUsername) => {
		if (typeof newUsername === "string") {
			fetchAndCheckProfile(newUsername);
		}
	},
);

useHead({
  title: 'Profile',
  meta: [
	{ name: 'description', content: 'View user profile and details.' }
  ]
})
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
			<UserProfile :profile="profileStore.publicProfile">
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

			<UserQuestions :user-id="profileStore.publicProfile.user_id" />
		</template>
	</div>
</template>
