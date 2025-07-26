<script setup lang="ts">
import { fetchFollowerCount as fetchFollowerCountUtil } from "~/utils/followUtils";

const props = defineProps<{ userId: string }>();
const followerCount = ref(0);
const loading = ref(true);

async function fetchFollowerCount() {
	loading.value = true;
	if (!props.userId) {
		followerCount.value = 0;
		loading.value = false;
		return;
	}
	followerCount.value = await fetchFollowerCountUtil(props.userId);
	loading.value = false;
}

onMounted(fetchFollowerCount);
watch(() => props.userId, fetchFollowerCount);

// Listen for follow/unfollow events to update count
const eventHandler = () => fetchFollowerCount();
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
	<span>
		{{ followerCount }} Follower{{ followerCount === 1 ? "" : "s" }}
	</span>
</template>
