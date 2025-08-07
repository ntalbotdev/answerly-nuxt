import type { Profile } from "~/stores/profile";

export async function fetchProfileById(
	userId: string
): Promise<Profile | null> {
	const supabase = useSupabaseClient();

	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("user_id", userId)
			.single();

		if (error) throw error;
		return data ?? null;
	} catch (err) {
		console.error("Failed to fetch profile by ID:", err);
		return null;
	}
}

export async function fetchProfileByUsername(
	username: string
): Promise<Profile | null> {
	const supabase = useSupabaseClient();

	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("username", username.toLowerCase())
			.single();

		if (error) throw error;
		return data ?? null;
	} catch (err) {
		console.error("Failed to fetch profile by username:", err);
		return null;
	}
}

export async function createProfile(
	userId: string,
	username: string,
	displayName?: string
): Promise<boolean> {
	const supabase = useSupabaseClient();

	try {
		const profileData: Partial<Profile> = {
			user_id: userId,
			username: username.toLowerCase(),
			display_name: displayName || username,
		};

		const { error } = await supabase
			.from("profiles")
			.insert([profileData] as never[]);
		if (error) throw error;
		return true;
	} catch (err) {
		console.error("Failed to create profile:", err);
		return false;
	}
}

export async function updateProfile(profile: Profile): Promise<Profile | null> {
	const supabase = useSupabaseClient();

	try {
		const updateObj = {
			user_id: profile.user_id,
			username: profile.username?.toLowerCase() || "",
			display_name: profile.display_name,
			bio: profile.bio,
			avatar_url: profile.avatar_url,
			banner_url: profile.banner_url,
			updated_at: new Date().toISOString(),
		};

		const { error } = await supabase
			.from("profiles")
			.update(updateObj as never)
			.eq("user_id", profile.user_id);

		if (error) throw error;

		// Return the updated profile
		return await fetchProfileById(profile.user_id);
	} catch (err) {
		console.error("Failed to update profile:", err);
		return null;
	}
}
