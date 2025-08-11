export async function followUser(targetUserId: string): Promise<boolean> {
	const user = useSupabaseUser();
	if (!user.value) return false;

	const supabase = useSupabaseClient();

	try {
		const followObj = {
			follower_id: user.value.id,
			following_id: targetUserId,
		};

		const { error } = await supabase
			.from("follows")
			.insert([followObj] as never[]);
		if (error) throw error;

		let username = user.value.user_metadata?.username || "Someone";
		try {
			const { data: profile } = await supabase
				.from("profiles")
				.select("username")
				.eq("user_id", user.value.id)
				.single<{ username: string }>();
			if (profile && profile.username) {
				username = profile.username;
			}
		} catch {
			// Ignore profile fetch errors, fallback to user_metadata
		}
		await sendNotification({
			user_id: targetUserId,
			type: "follow",
			payload: {
				follower_id: user.value.id,
				following_id: targetUserId,
				username: username,
			},
		});
		return true;
	} catch {
		return false;
	}
}

export async function unfollowUser(targetUserId: string): Promise<boolean> {
	const user = useSupabaseUser();
	if (!user.value) return false;

	const supabase = useSupabaseClient();

	try {
		const { error } = await supabase
			.from("follows")
			.delete()
			.eq("follower_id", user.value.id)
			.eq("following_id", targetUserId);

		if (error) throw error;

		try {
			const followEventId = `${user.value.id}:${targetUserId}`;

			const { error: deleteError } = await supabase
				.from("notifications")
				.delete()
				.eq("user_id", targetUserId)
				.eq("event_id", followEventId)
				.eq("type", "follow");

			if (deleteError) {
				// handle error if needed
			}
		} catch {
			// handle error if needed
		}

		return true;
	} catch {
		return false;
	}
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
	const user = useSupabaseUser();
	if (!user.value) return false;

	const supabase = useSupabaseClient();

	try {
		const { data, error } = await supabase
			.from("follows")
			.select("follower_id")
			.eq("follower_id", user.value.id)
			.eq("following_id", targetUserId);

		if (error) {
			return false;
		}

		return data && data.length > 0;
	} catch {
		return false;
	}
}

export async function isFollowingMe(followerUserId: string): Promise<boolean> {
	const user = useSupabaseUser();
	if (!user.value) return false;

	const supabase = useSupabaseClient();

	try {
		const { data, error } = await supabase
			.from("follows")
			.select("follower_id")
			.eq("follower_id", followerUserId)
			.eq("following_id", user.value.id);

		return !!data && !error;
	} catch {
		return false;
	}
}

export async function fetchFollowerCount(userId: string): Promise<number> {
	const supabase = useSupabaseClient();

	try {
		const { count, error } = await supabase
			.from("follows")
			.select("follower_id", { count: "exact", head: true })
			.eq("following_id", userId);

		if (error) return 0;
		return count || 0;
	} catch {
		return 0;
	}
}

export async function fetchFollowingCount(userId: string): Promise<number> {
	const supabase = useSupabaseClient();

	try {
		const { count, error } = await supabase
			.from("follows")
			.select("following_id", { count: "exact", head: true })
			.eq("follower_id", userId);

		if (error) return 0;
		return count || 0;
	} catch {
		return 0;
	}
}

export async function fetchFollowers(userId: string) {
	const supabase = useSupabaseClient();

	try {
		const { data, error } = await supabase
			.from("follows")
			.select(
				"follower_id, profiles:follower_id(username, avatar_url, bio)"
			)
			.eq("following_id", userId);

		if (error) throw new Error(error.message);
		return data || [];
	} catch {
		return [];
	}
}

export async function fetchFollows(userId: string) {
	const supabase = useSupabaseClient();

	try {
		const { data, error } = await supabase
			.from("follows")
			.select(
				"following_id, profiles:following_id(username, avatar_url, bio)"
			)
			.eq("follower_id", userId);

		if (error) throw new Error(error.message);
		return data || [];
	} catch {
		return [];
	}
}
