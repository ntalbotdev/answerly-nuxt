<script setup lang="ts">
import { fetchFollowingCount as fetchFollowingCountUtil } from '~/utils/followUtils';

const props = defineProps<{ userId: string }>();
const followingCount = ref(0);
const loading = ref(true);

async function fetchFollowingCount() {
  loading.value = true;
  if (!props.userId) {
    followingCount.value = 0;
    loading.value = false;
    return;
  }
  followingCount.value = await fetchFollowingCountUtil(props.userId);
  loading.value = false;
}

onMounted(fetchFollowingCount);
watch(() => props.userId, fetchFollowingCount);

// Listen for follow/unfollow events to update count
const eventHandler = () => fetchFollowingCount();
if (typeof window !== 'undefined') {
  window.addEventListener('follow-status-changed', eventHandler);
}
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('follow-status-changed', eventHandler);
  }
});
</script>

<template>
  <span>{{ followingCount }} Following</span>
</template>
