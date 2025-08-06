export const useProfilePage = (username: string) => {
	const supabase = useSupabaseClient();
	const loading = ref(true);
	const error = ref("");
	const profile = ref<any>(null);

	const fetchUserProfile = async () => {
		loading.value = true;
		error.value = "";

		try {
			const { data, error: profileError } = await supabase
				.from("profiles")
				.select("user_id, username, display_name, avatar_url, bio")
				.eq("username", username.toLowerCase())
				.single();

			if (profileError || !data) {
				error.value = "User not found.";
				profile.value = null;
				return null;
			}

			profile.value = data;
			return data;
		} catch (err) {
			error.value = "Failed to load profile.";
			profile.value = null;
			return null;
		} finally {
			loading.value = false;
		}
	};

	const fetchFollowers = async () => {
		if (!profile.value?.user_id) return [];

		const { data, error: followersError } = await supabase
			.from("follows")
			.select(
				`
				follower_id, 
				profiles:follower_id(
					username, 
					display_name, 
					avatar_url, 
					bio
				)
			`
			)
			.eq("following_id", profile.value.user_id);

		if (followersError) {
			throw new Error(
				followersError.message || "Failed to load followers."
			);
		}

		return data || [];
	};

	const fetchFollowing = async () => {
		if (!profile.value?.user_id) return [];

		const { data, error: followingError } = await supabase
			.from("follows")
			.select(
				`
				following_id, 
				profiles:following_id(
					username, 
					display_name, 
					avatar_url, 
					bio
				)
			`
			)
			.eq("follower_id", profile.value.user_id);

		if (followingError) {
			throw new Error(
				followingError.message || "Failed to load following."
			);
		}

		return data || [];
	};

	const fetchQuestions = async () => {
		if (!profile.value?.user_id) return [];

		const { data, error: questionsError } = await supabase
			.from("questions")
			.select(
				`
				id, 
				from_user_id, 
				question, 
				is_anonymous, 
				answer, 
				published, 
				created_at,
				profiles:from_user_id(username, avatar_url, display_name)
			`
			)
			.eq("to_user_id", profile.value.user_id)
			.eq("published", true)
			.order("created_at", { ascending: false });

		if (questionsError) {
			throw new Error(
				questionsError.message || "Failed to load questions."
			);
		}

		return data || [];
	};

	return {
		loading: readonly(loading),
		error: readonly(error),
		profile: readonly(profile),
		fetchUserProfile,
		fetchFollowers,
		fetchFollowing,
		fetchQuestions,
	};
};
