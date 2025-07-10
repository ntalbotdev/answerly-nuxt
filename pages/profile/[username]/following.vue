<script setup lang="ts">
const route = useRoute();
const username = route.params.username as string;
const supabase = useSupabaseClient();
const following = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
    loading.value = true;
    // Get the user_id for this username
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("username", username)
        .single();
    if (profileError || !profile) {
        error.value = "User not found.";
        loading.value = false;
        return;
    }
    // Fetch following
    const { data, error: qError } = await supabase
        .from("follows")
        .select(
            "following_id, profiles:following_id(username, avatar_url, bio)"
        )
        .eq("follower_id", profile.user_id);
    if (qError) {
        error.value = qError.message || "Failed to load following.";
        following.value = [];
    } else {
        following.value = data || [];
    }
    loading.value = false;
});
</script>

<template>
    <div>
        <h1>Following of {{ username }}</h1>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" style="color: red">{{ error }}</div>
        <div v-else>
            <div v-if="following.length === 0">Not following anyone yet.</div>
            <div v-else>
                <div v-for="f in following" :key="f.following_id">
                    <img
                        v-if="f.profiles?.avatar_url"
                        :src="f.profiles.avatar_url"
                        alt="Avatar"
                    />
                    <div>
                        <strong>{{ f.profiles?.username }}</strong>
                        <p v-if="f.profiles?.bio">{{ f.profiles.bio }}</p>
                        <NuxtLink :to="`/profile/${f.profiles?.username}`">
                            View Profile
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
