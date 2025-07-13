<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
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
    followsMe.value = false;
    // Check if the target user follows me
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", props.targetUserId)
        .eq("following_id", user.value.id)
        .single();
    followsMe.value = !!data && !error;
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
    <div v-if="!loading">
        <span v-if="iFollow && followsMe">You follow each other</span>
        <span v-else-if="iFollow">You follow this user</span>
        <span v-else-if="followsMe">This user follows you</span>
        <span v-else>You do not follow each other</span>
    </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variables.scss";

div {
    color: $color-muted;
}
</style>
