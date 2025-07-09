<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
import { useRoute } from "vue-router";

const route = useRoute();
const profileStore = useProfileStore();
const slug = route.params.slug as string;

onMounted(async () => {
    await profileStore.fetchProfileByUsername(slug);
});
</script>

<template>
    <div>
        <h1>Profile: {{ slug }}</h1>
        <div v-if="profileStore.loading">Loading...</div>
        <div v-else-if="profileStore.error" style="color: red">
            {{ profileStore.error }}
        </div>
        <div v-else-if="profileStore.profile">
            <p>
                <strong>Username:</strong> {{ profileStore.profile.username }}
            </p>
            <p v-if="profileStore.profile.bio">
                <strong>Bio:</strong> {{ profileStore.profile.bio }}
            </p>
            <img
                v-if="profileStore.profile.avatar_url"
                :src="profileStore.profile.avatar_url"
                alt="Avatar"
                style="max-width: 100px; max-height: 100px"
            />
        </div>
        <div v-else>
            <p>User not found.</p>
        </div>
    </div>
</template>
