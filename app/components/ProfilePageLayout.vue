<script setup lang="ts">
interface Props {
	username: string;
	title?: string;
	description?: string;
}

const props = withDefaults(defineProps<Props>(), {
	title: "Profile",
	description: "View user profile and details.",
});

const profileStore = useProfileStore();
const route = useRoute();
const user = useSupabaseUser();

const usernameParam = props.username;
const { isUUID } = parseUsernameOrUUID(usernameParam);

if (isUUID && user.value && usernameParam === user.value.id) {
	if (!profileStore.myProfile) {
		await profileStore.fetchProfileById(user.value.id);
	}

	if (
		profileStore.myProfile?.username &&
		profileStore.myProfile.username !== usernameParam
	) {
		await navigateTo(ROUTES.PROFILE_USER(profileStore.myProfile.username), {
			replace: true,
		});
	}
}

onMounted(() => {
	if (!isUUID) {
		profileStore.fetchProfileByUsername(usernameParam);
	}
});

watch(
	() => props.username,
	(newUsername) => {
		if (newUsername && !isUUID) {
			profileStore.fetchProfileByUsername(newUsername);
		}
	}
);

useHead({
	title: computed(() => {
		if (profileStore.publicProfile) {
			const displayName =
				profileStore.publicProfile.display_name ||
				profileStore.publicProfile.username;
			return `${displayName} (@${profileStore.publicProfile.username})`;
		}
		return props.title;
	}),
	meta: [{ name: "description", content: props.description }],
});

async function refreshProfile() {
	if (profileStore.publicProfile?.username) {
		await profileStore.fetchProfileByUsername(
			profileStore.publicProfile.username
		);
		profileStore.publicProfile = { ...profileStore.publicProfile };

		if (
			user.value &&
			profileStore.publicProfile.user_id === user.value.id &&
			profileStore.publicProfile.username !== route.params.username
		) {
			await navigateTo(
				ROUTES.PROFILE_USER(profileStore.publicProfile.username),
				{
					replace: true,
				}
			);
		}
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
			<slot
				:profile="profileStore.publicProfile"
				:refresh-profile="refreshProfile"
				:user="user"
			/>
		</template>
	</div>
</template>
