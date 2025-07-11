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
	<div class="relative flex min-h-screen w-full items-center py-10">
		<div
			class="relative mx-auto w-full max-w-xl rounded-3xl border border-gray-100 bg-white/90 p-8 shadow-2xl ring-1 ring-blue-100 backdrop-blur-lg dark:border-indigo-200 dark:bg-white/70 dark:ring-indigo-100"
		>
			<template v-if="profileStore.loading">
				<div class="text-gray-400">Loading...</div>
			</template>
			<template v-else-if="profileStore.error">
				<div class="mb-2 text-red-500">{{ profileStore.error }}</div>
			</template>
			<template v-else-if="profileStore.publicProfile">
				<UserProfileCard :profile="profileStore.publicProfile">
					<template #mutual-status>
						<MutualFollowStatus
							v-if="
								user &&
								user.id !== profileStore.publicProfile.user_id
							"
							:target-user-id="profileStore.publicProfile.user_id"
							class="block"
						/>
					</template>
				</UserProfileCard>
				<div
					v-if="
						user && user.id !== profileStore.publicProfile.user_id
					"
					class="mb-8 flex w-full flex-col items-center gap-4"
				>
					<div
						class="flex w-full flex-col items-center gap-4 sm:flex-row"
					>
						<button
							:class="[
								'flex items-center justify-center gap-2 rounded-2xl px-7 py-2 text-base font-semibold',
								isFollowing ? 'text-red-700' : 'text-blue-700',
							]"
							:aria-pressed="isFollowing"
							@click="
								isFollowing ? handleUnfollow() : handleFollow()
							"
						>
							<Icon
								:name="
									isFollowing
										? 'bx:user-minus'
										: 'bx:user-plus'
								"
								class="h-5 w-5 text-inherit"
							/>
							<span class="font-semibold">{{
								isFollowing ? "Unfollow" : "Follow"
							}}</span>
						</button>
						<NuxtLink
							:to="`/ask/${profileStore.publicProfile.username}`"
							class="flex-1 items-center px-7 py-2 text-center text-base font-semibold"
						>
							<Icon
								name="bx:question-mark"
								class="mr-1 h-5 w-5 align-text-bottom"
							/>
							Ask {{ profileStore.publicProfile.username }} a
							question
						</NuxtLink>
					</div>
				</div>
				<NuxtLink
					:to="`/profile/${profileStore.publicProfile.username}/questions`"
					class="mt-2 block px-4 py-2 text-center font-medium"
				>
					<Icon
						name="bx:question-mark"
						class="mr-1 h-5 w-5 align-text-bottom"
					/>
					View Questions
				</NuxtLink>
			</template>
			<template v-else>
				<div class="py-12 text-center text-gray-500">
					<p>User not found.</p>
				</div>
			</template>
		</div>
	</div>
</template>
