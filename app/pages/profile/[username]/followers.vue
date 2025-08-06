<script setup lang="ts">
const route = useRoute();
const username = route.params.username as string;
const { loading, error, profile, fetchUserProfile, fetchFollowers } =
	useProfilePage(username);

const followers = ref<any[]>([]);
const followersLoading = ref(false);
const followersError = ref("");

definePageMeta({
	middleware: "auth",
});

useHead({
	title: computed(() => {
		if (profile.value) {
			const displayName =
				profile.value.display_name || profile.value.username;
			return `${displayName} (@${profile.value.username}) Followers`;
		}
		return `@${username} Followers`;
	}),
	meta: [
		{
			name: "description",
			content: "View the list of followers for this user.",
		},
	],
});

onMounted(async () => {
	const profileData = await fetchUserProfile();
	if (profileData) {
		await loadFollowers();
	}
});

async function loadFollowers() {
	followersLoading.value = true;
	followersError.value = "";

	try {
		followers.value = await fetchFollowers();
	} catch (err) {
		followersError.value = (err as Error).message;
	} finally {
		followersLoading.value = false;
	}
}
</script>

<template>
	<div class="section followers">
		<LoadingError
			:loading="loading"
			:error="error"
			loading-text="Loading profile..."
		>
			<div v-if="profile">
				<h2 class="section__title followers__title">
					{{ profile.display_name || profile.username }}'s Followers
					<span v-if="!followersLoading" class="follow-count">
						({{ followers.length }})
					</span>
				</h2>

				<LoadingError
					:loading="followersLoading"
					:error="followersError"
					:show-empty-state="followers.length === 0"
					empty-state="No followers yet."
					loading-text="Loading followers..."
				>
					<div class="follow-grid">
						<ProfileCard
							v-for="follower in followers"
							:key="follower.follower_id"
							:profile="follower.profiles"
							size="medium"
						/>
					</div>
				</LoadingError>
			</div>
		</LoadingError>
	</div>
</template>
