<script setup lang="ts">
const props = defineProps<{ targetUserId: string }>();
const user = useSupabaseUser();
const profileStore = useProfileStore();
const iFollow = ref(false);
const followsMe = ref(false);
const loading = ref(true);

// Check if the user follows the target user and if the target user follows me
async function checkStatus() {
	loading.value = true;
	if (!user.value || !props.targetUserId) {
		iFollow.value = false;
		followsMe.value = false;
		loading.value = false;
		return;
	}
	iFollow.value = await profileStore.isFollowing(props.targetUserId);
	followsMe.value = await isFollowingMe(props.targetUserId);
	loading.value = false;
}
onMounted(checkStatus);

watch(
	[() => props.targetUserId, () => user.value && user.value.id],
	checkStatus
);

// Also listen for follow/unfollow events via a custom event
const eventHandler = () => checkStatus();
if (typeof window !== "undefined") {
	window.addEventListener("follow-status-changed", eventHandler);
}
onUnmounted(() => {
	if (typeof window !== "undefined") {
		window.removeEventListener("follow-status-changed", eventHandler);
	}
});
</script>

<template>
	<div v-if="!loading" class="muted-text">
		<span v-if="iFollow && followsMe">You follow each other</span>
		<span v-else-if="iFollow">You follow this user</span>
		<span v-else-if="followsMe">This user follows you</span>
		<span v-else>You do not follow each other</span>
	</div>
</template>
