<script setup lang="ts">
const route = useRoute();
const username = route.params.username as string;
const supabase = useSupabaseClient();
const followers = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

definePageMeta({
	// This page requires authentication
	middleware: "auth",
});

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
	// Fetch followers
	const { data, error: qError } = await supabase
		.from("follows")
		.select("follower_id, profiles:follower_id(username, avatar_url, bio)")
		.eq("following_id", profile.user_id);
	if (qError) {
		error.value = qError.message || "Failed to load followers.";
		followers.value = [];
	} else {
		followers.value = data || [];
	}
	loading.value = false;
});
</script>

<template>
	<div>
		<h1>Followers of {{ username }}</h1>
		<div v-if="loading" class="loading-text">Loading...</div>
		<div v-else-if="error" class="error-text">{{ error }}</div>
		<div v-else>
			<div v-if="followers.length === 0">No followers yet.</div>
			<div v-else>
				<div v-for="f in followers" :key="f.follower_id">
					<img
						v-if="f.profiles?.avatar_url"
						:src="f.profiles.avatar_url"
						alt="Avatar"
					/>
					<div>
						<strong>{{ f.profiles?.username }}</strong>
						<p v-if="f.profiles?.bio">{{ f.profiles.bio }}</p>
						<NuxtLink
							:to="ROUTES.PROFILE_USER(f.profiles?.username)"
						>
							View Profile
						</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
