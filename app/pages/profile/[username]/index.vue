<script setup lang="ts">
const route = useRoute();
const username = route.params.username as string;
</script>

<template>
	<ProfilePageLayout
		:username="username"
		title="Profile"
		description="View user profile and details."
	>
		<template #default="{ profile, refreshProfile, user }">
			<UserProfile :profile="profile" @profile-updated="refreshProfile">
				<template #mutual-status>
					<MutualFollowStatus
						v-if="user && user.id !== profile.user_id"
						:target-user-id="profile.user_id"
					/>
				</template>
			</UserProfile>

			<UserQuestions :user-id="profile.user_id" :profile="profile" />
		</template>
	</ProfilePageLayout>
</template>
