<script setup lang="ts">
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
        <h1>My Profile</h1>
        <div v-if="profileStore.loading">Loading...</div>
        <div v-else-if="profileStore.error" style="color: red">
            {{ profileStore.error }}
        </div>
        <div v-else-if="profileStore.myProfile">
            <p>
                <strong>Username:</strong> {{ profileStore.myProfile.username }}
            </p>
            <p v-if="profileStore.myProfile.bio">
                <strong>Bio:</strong> {{ profileStore.myProfile.bio }}
            </p>
            <img
                v-if="profileStore.myProfile.avatar_url"
                :src="profileStore.myProfile.avatar_url"
                alt="Avatar"
                style="display: block"
            />
            <NuxtLink to="/my/profile/edit">
                <button>Edit Profile</button>
            </NuxtLink>
        </div>
        <div v-else>
            <p>User not found.</p>
        </div>
    </div>
</template>
