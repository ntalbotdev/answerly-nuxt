<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";

const profileStore = useProfileStore();
const route = useRoute();
const router = useRouter();

const fetchAndCheckProfile = async (username: string) => {
    await profileStore.fetchProfileByUsername(username);
    if (!profileStore.publicProfile && !profileStore.loading) {
        router.push("/");
    }
};

onMounted(() => {
    fetchAndCheckProfile(route.params.username as string);
});

watch(
    () => route.params.username,
    (newUsername) => {
        if (typeof newUsername === "string") {
            fetchAndCheckProfile(newUsername);
        }
    }
);
</script>

<template>
    <div>
        <h1>Profile: {{ route.params.username }}</h1>
        <div v-if="profileStore.loading">Loading...</div>
        <div v-else-if="profileStore.error" style="color: red">
            {{ profileStore.error }}
        </div>
        <div v-else-if="profileStore.publicProfile">
            <p>
                <strong>Username:</strong>
                {{ profileStore.publicProfile.username }}
            </p>
            <p v-if="profileStore.publicProfile.bio">
                <strong>Bio:</strong> {{ profileStore.publicProfile.bio }}
            </p>
            <img
                v-if="profileStore.publicProfile.avatar_url"
                :src="profileStore.publicProfile.avatar_url"
                alt="Avatar"
                style="max-width: 100px; max-height: 100px"
            />
        </div>
        <div v-else>
            <p>User not found.</p>
        </div>
    </div>
</template>
