<script setup lang="ts">
const profileStore = useProfileStore();
const user = useSupabaseUser();

definePageMeta({
    // This page requires authentication
    middleware: "auth",
});

onMounted(async () => {
    // Fetch the user's profile, if it exists, when the component is mounted
    if (user.value) {
        await profileStore.fetchProfileById(user.value.id);
    }
});
</script>

<template>
    <div>
        <div v-if="profileStore.loading" class="loading-text">Loading...</div>
        <div v-else-if="profileStore.error" class="error-text">
            {{ profileStore.error }}
        </div>
        <div v-else-if="profileStore.myProfile">
            <UserProfile :profile="profileStore.myProfile" />
        </div>
        <div v-else>
            <p>User not found.</p>
        </div>
    </div>
</template>
