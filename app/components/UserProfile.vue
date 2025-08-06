<script setup lang="ts">
const props = defineProps<{ profile: any }>();
const emit = defineEmits(["profile-updated"]);
const user = useSupabaseUser();
const canEdit = computed(() => {
	return (
		user.value &&
		props.profile?.user_id &&
		user.value.id === props.profile.user_id
	);
});
const profileStore = useProfileStore();
const followStatus = ref(false);
const followerCount = ref(0);
const showEditModal = ref(false);
const showAskModal = ref(false);
const showConfirmUnfollowModal = ref(false);

function handleCloseEditModal() {
	showEditModal.value = false;
}

async function handleProfileUpdated() {
	emit("profile-updated");
	showEditModal.value = false;
}

function handleCloseAskModal() {
	showAskModal.value = false;
}
async function fetchFollowStatus() {
	if (!props.profile?.user_id) return;
	followerCount.value = await profileStore.fetchFollowerCount(
		props.profile.user_id
	);
	if (user.value && user.value.id !== props.profile.user_id) {
		followStatus.value = await profileStore.isFollowing(
			props.profile.user_id
		);
	}
}
onMounted(fetchFollowStatus);
watch(() => props.profile?.user_id, fetchFollowStatus);

async function handleFollow() {
	if (!props.profile?.user_id) return;
	await profileStore.followUser(props.profile.user_id);
	followStatus.value = true;
	followerCount.value = await profileStore.fetchFollowerCount(
		props.profile.user_id
	);
	window.dispatchEvent(new Event("follow-status-changed"));
}

function requestUnfollow() {
	showConfirmUnfollowModal.value = true;
}

async function confirmUnfollow() {
	if (!props.profile?.user_id) return;
	await profileStore.unfollowUser(props.profile.user_id);
	followStatus.value = false;
	followerCount.value = await profileStore.fetchFollowerCount(
		props.profile.user_id
	);
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
			<EditProfileForm
				:key="props.profile.user_id + '-' + props.profile.updated_at"
				:profile="props.profile"
				@close="handleCloseEditModal"
				@profile-updated="handleProfileUpdated"
			/>
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
									followStatus
										? 'text-red-700'
										: 'text-blue-700'
								"
								:aria-pressed="followStatus"
								@click="
									followStatus
										? requestUnfollow()
										: handleFollow()
								"
							>
								<Icon
									:name="
										followStatus
											? 'bx:user-minus'
											: 'bx:plus'
									"
									class="profile__action-icon"
								/>
								<span class="profile__action-text">
									{{ followStatus ? "Unfollow" : "Follow" }}
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
