<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
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
  const supabase = useSupabaseClient();
  const { count } = await supabase
    .from('follows')
    .select('following_id', { count: 'exact', head: true })
    .eq('follower_id', props.userId);
  followingCount.value = count || 0;
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
