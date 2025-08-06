<script setup lang="ts">
const route = useRoute();
const username = route.params.username as string;
const { loading, error, profile, fetchUserProfile, fetchFollowing } =
	useProfilePage(username);

const following = ref<any[]>([]);
const followingLoading = ref(false);
const followingError = ref("");

definePageMeta({
	middleware: "auth",
});

useHead({
	title: `Following of ${username}`,
	meta: [
		{
			name: "description",
			content: "View the list of users this person is following.",
		},
	],
});

onMounted(async () => {
	const profileData = await fetchUserProfile();
	if (profileData) {
		await loadFollowing();
	}
});

async function loadFollowing() {
	followingLoading.value = true;
	followingError.value = "";

	try {
		following.value = await fetchFollowing();
	} catch (err) {
		followingError.value = (err as Error).message;
	} finally {
		followingLoading.value = false;
	}
}
</script>

<template>
	<div class="section following">
		<LoadingError
			:loading="loading"
			:error="error"
			loading-text="Loading profile..."
		>
			<div v-if="profile">
				<h2 class="section__title following__title">
					{{ profile.display_name || profile.username }} is Following
				</h2>

				<LoadingError
					:loading="followingLoading"
					:error="followingError"
					:show-empty-state="following.length === 0"
					empty-state="Not following anyone yet."
					loading-text="Loading following..."
				>
					<div class="follow-grid">
						<ProfileCard
							v-for="follow in following"
							:key="follow.following_id"
							:profile="follow.profiles"
							size="medium"
						/>
					</div>
				</LoadingError>
			</div>
		</LoadingError>
	</div>
</template>
