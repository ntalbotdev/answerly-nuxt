<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
const profileStore = useProfileStore();
const router = useRouter();
const route = useRoute();
const user = useSupabaseUser();
const isFollowing = ref(false);
const followerCount = ref(0);

const fetchAndCheckProfile = async (username: string) => {
	await profileStore.fetchProfileByUsername(username);
	if (!profileStore.publicProfile && !profileStore.loading) {
		router.push("/");
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

async function handleFollow() {
	if (!profileStore.publicProfile) return;
	await profileStore.followUser(profileStore.publicProfile.user_id);
	isFollowing.value = true;
	followerCount.value++;
	window.dispatchEvent(new Event("follow-status-changed"));
}

async function handleUnfollow() {
	if (!profileStore.publicProfile) return;
	await profileStore.unfollowUser(profileStore.publicProfile.user_id);
	isFollowing.value = false;
	followerCount.value = Math.max(0, followerCount.value - 1);
	window.dispatchEvent(new Event("follow-status-changed"));
}
</script>

<template>
	<div>
		<h1>Profile: {{ route.params.username }}</h1>
		<div v-if="profileStore.loading">Loading...</div>
		<div v-else-if="profileStore.error" style="color: red">
			{{ profileStore.error }}
		</div>
		<div v-else-if="profileStore.publicProfile">
			<p>
				<strong>Username:</strong>
				{{ profileStore.publicProfile.username }}
			</p>
			<p v-if="profileStore.publicProfile.bio">
				<strong>Bio:</strong> {{ profileStore.publicProfile.bio }}
			</p>
			<img
				v-if="profileStore.publicProfile.avatar_url"
				:src="profileStore.publicProfile.avatar_url"
				alt="Avatar"
			/>
			<NuxtLink
				:to="`/profile/${profileStore.publicProfile.username}/followers`"
			>
				<FollowerCount :user-id="profileStore.publicProfile.user_id" />
			</NuxtLink>
			<NuxtLink
				:to="`/profile/${profileStore.publicProfile.username}/following`"
			>
				<FollowingCount :user-id="profileStore.publicProfile.user_id" />
			</NuxtLink>

			<template
				v-if="user && user.id !== profileStore.publicProfile.user_id"
			>
				<MutualFollowStatus
					:target-user-id="profileStore.publicProfile.user_id"
				/>
				<button
					@click="isFollowing ? handleUnfollow() : handleFollow()"
				>
					{{ isFollowing ? "Unfollow" : "Follow" }}
				</button>
				<NuxtLink :to="`/ask/${profileStore.publicProfile.username}`">
					Ask {{ profileStore.publicProfile.username }} a question
				</NuxtLink>
			</template>
			<NuxtLink
				:to="`/profile/${profileStore.publicProfile.username}/questions`"
			>
				View Questions
			</NuxtLink>
		</div>
		<div v-else>
			<p>User not found.</p>
		</div>
	</div>
</template>
