<script setup lang="ts">
import UserProfile from '~/components/UserProfile.vue';
import { useProfileStore } from "~/stores/profile";
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
        <div v-if="profileStore.loading">Loading...</div>
        <div v-else-if="profileStore.error" style="color: red">
            {{ profileStore.error }}
        </div>
        <div v-else-if="profileStore.myProfile">
            <UserProfile :profile="profileStore.myProfile" />
            <NuxtLink to="/my/profile/edit">
                Edit Profile
            </NuxtLink>
        </div>
        <div v-else>
            <p>User not found.</p>
        </div>
    </div>
</template>
