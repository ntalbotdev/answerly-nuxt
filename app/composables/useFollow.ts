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
			.insert([followObj] as any);
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
			message: `${username} followed you.`,
			payload: {
				follower_id: user.value.id,
				following_id: targetUserId,
			},
		});
		return true;
	} catch (err) {
		console.error("Failed to follow user:", err);
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

			const config = useRuntimeConfig();
			const supabaseUrl = config.public.supabaseUrl;
			const supabaseAnonKey = config.public.supabaseKey;
			const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification`;

			const response = await fetch(edgeFunctionUrl, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${supabaseAnonKey}`,
				},
				body: JSON.stringify({
					user_id: targetUserId,
					event_id: followEventId,
					type: "follow",
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(
					"Failed to delete follow notification:",
					errorText
				);
			}
		} catch (notifError) {
			console.error("Failed to handle notification cleanup:", notifError);
		}

		return true;
	} catch (err) {
		console.error("Failed to unfollow user:", err);
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
			.eq("following_id", targetUserId)
			.single();

		return !!data && !error;
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
			.eq("following_id", user.value.id)
			.single();

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
	} catch (err) {
		console.error("Failed to fetch followers:", err);
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
	} catch (err) {
		console.error("Failed to fetch follows:", err);
		return [];
	}
}
