<script setup lang="ts">
const props = defineProps<{ profile: any }>();
const route = useRoute();
const canEdit = computed(() => route.path === ROUTES.PROFILE);
const profileStore = useProfileStore();
const user = useSupabaseUser();
const isFollowing = ref(false);
const followerCount = ref(0);
const showEditModal = ref(false);
const showAskModal = ref(false);
const showConfirmUnfollowModal = ref(false);

// Watch for query ?edit=1 and open modal only when it appears
watch(
	() => route.query.edit,
	(edit) => {
		// Open modal when ?edit=1 is present
		showEditModal.value = edit === "1";
	},
	{ immediate: true },
);


function handleCloseEditModal() {
	showEditModal.value = false;
	navigateTo({ path: route.path, query: {} });
}

function handleCloseAskModal() {
	showAskModal.value = false;
}

// Fetch follow status and follower count when mounted or when the profile changes
async function fetchFollowStatus() {
	if (!props.profile?.user_id) return;
	const supabase = useSupabaseClient();
	// Fetch follower count
	const { count } = await supabase
		.from("follows")
		.select("follower_id", { count: "exact", head: true })
		.eq("following_id", props.profile.user_id);
	followerCount.value = count || 0;
	// Check follow status
	if (user.value && user.value.id !== props.profile.user_id) {
		isFollowing.value = await profileStore.isFollowing(
			props.profile.user_id,
		);
	}
}
onMounted(fetchFollowStatus);
watch(() => props.profile?.user_id, fetchFollowStatus);

async function handleFollow() {
	if (!props.profile?.user_id) return;
	await profileStore.followUser(props.profile.user_id);
	isFollowing.value = true;
	followerCount.value++;
	window.dispatchEvent(new Event("follow-status-changed"));
}

function requestUnfollow() {
	showConfirmUnfollowModal.value = true;
}

async function confirmUnfollow() {
	if (!props.profile?.user_id) return;
	await profileStore.unfollowUser(props.profile.user_id);
	isFollowing.value = false;
	followerCount.value = Math.max(0, followerCount.value - 1);
	window.dispatchEvent(new Event("follow-status-changed"));
	showConfirmUnfollowModal.value = false;
}

function closeConfirmUnfollowModal() {
	showConfirmUnfollowModal.value = false;
}
</script>

<template>
	<div class="profile">
		<AppModal
			v-model:open="showEditModal"
			title="Edit Profile"
			@close="handleCloseEditModal"
		>
			<EditProfileForm :profile="props.profile" @close="handleCloseEditModal" />
		</AppModal>

		<AppModal v-model:open="showAskModal" title="Ask a Question">
			<AskForm :profile="props.profile" @close="handleCloseAskModal" />
		</AppModal>

		<ConfirmUnfollowModal
			:open="showConfirmUnfollowModal"
			:username="props.profile?.username"
			@close="closeConfirmUnfollowModal"
			@confirm="confirmUnfollow"
		/>

		<div class="profile__header">
			<div class="profile__banner">
				<div class="profile__actions">
					<template v-if="canEdit">
						<button
							class="profile__action profile__action--edit-profile"
							@click="showEditModal = true"
						>
							<Icon name="bx:edit" class="profile__action-icon" />
							<span class="profile__action-text">
								Edit Profile
							</span>
						</button>
					</template>

					<template v-else>
						<button
							v-if="user && user.id === props.profile.user_id"
							class="profile__action profile__action--edit-profile"
							@click="
								$router.push({
									path: ROUTES.PROFILE,
									query: { edit: '1' },
								})
							"
						>
							<Icon name="bx:edit" class="profile__action-icon" />
							<span class="profile__action-text">
								Edit Profile
							</span>
						</button>

						<template
							v-if="user && user.id !== props.profile.user_id"
						>
							<button
								class="profile__action profile__action--ask"
								@click="showAskModal = true"
							>
								<Icon
									name="bx:question-mark"
									class="profile__action-icon"
								/>
								<span class="profile__action-text">
									Ask
									<span class="profile__action-text--hide">
										a Question
									</span>
								</span>
							</button>

							<button
								class="profile__action profile__action--follow"
								:class="
									isFollowing
										? 'text-red-700'
										: 'text-blue-700'
								"
								:aria-pressed="isFollowing"
								@click="
									isFollowing
										? requestUnfollow()
										: handleFollow()
								"
							>
								<Icon
									:name="
										isFollowing
											? 'bx:user-minus'
											: 'bx:plus'
									"
									class="profile__action-icon"
								/>
								<span class="profile__action-text">
									{{ isFollowing ? "Unfollow" : "Follow" }}
								</span>
							</button>

							<button
								class="profile__action profile__action--report"
							>
								<Icon
									name="bx:flag"
									class="profile__action-icon"
								/>
								<span class="profile__action-text">Report</span>
							</button>

							<button
								class="profile__action profile__action--block"
							>
								<Icon
									name="bx:block"
									class="profile__action-icon"
								/>
								<span class="profile__action-text">Block</span>
							</button>
						</template>
					</template>
				</div>

				<div class="profile__banner-img-wrapper">
					<img
						v-if="profile.banner_url"
						:src="profile.banner_url"
						alt="Banner"
						class="profile__banner-img"
					/>
				</div>
			</div>

			<img
				v-if="profile.avatar_url"
				:src="profile.avatar_url"
				alt="Avatar"
				class="profile__avatar"
			/>
			<!-- Placeholder for avatar if not set -->
			<span v-else class="profile__avatar profile__avatar--placeholder">
				{{ profile.username?.charAt(0).toUpperCase() }}
			</span>
		</div>

		<div class="profile__name-wrapper">
			<h2 class="profile__name">
				{{ profile.display_name || profile.username }}
			</h2>

			<span class="profile__user-url"> @{{ profile.username }}</span>
		</div>

		<div v-if="profile.bio" class="profile__bio">
			{{ profile.bio }}
		</div>

		<div class="profile__stats">
			<div class="profile__stats-mutual-status">
				<slot name="mutual-status" />
			</div>

			<div class="profile__stats-follow-count-wrapper">
				<NuxtLink
					:to="ROUTES.PROFILE_USER_FOLLOWERS(profile.username)"
					class="profile__stats-follow-count"
				>
					<Icon
						name="bx:happy-heart-eyes"
						class="profile__stats-icon"
					/>
					<FollowerCount :user-id="profile.user_id" />
				</NuxtLink>
				<NuxtLink
					:to="ROUTES.PROFILE_USER_FOLLOWING(profile.username)"
					class="profile__stats-follow-count"
				>
					<Icon name="bx:user" class="profile__stats-icon" />
					<FollowingCount :user-id="profile.user_id" />
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
