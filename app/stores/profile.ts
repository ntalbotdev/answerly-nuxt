import { defineStore } from "pinia";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
	fetchProfileById,
	fetchProfileByUsername,
	createProfile as createProfileUtil,
} from "~/composables/useProfile";
import {
	followUser as followUserUtil,
	unfollowUser as unfollowUserUtil,
	isFollowing as isFollowingUtil,
	fetchFollowerCount as fetchFollowerCountUtil,
	fetchFollowers as fetchFollowersUtil,
	fetchFollows as fetchFollowsUtil,
} from "~/composables/useFollow";

export interface ProfileRow {
	user_id: string;
	username: string;
	display_name?: string;
	avatar_url?: string;
	banner_url?: string;
	bio?: string;
	created_at?: string;
	updated_at?: string;
}

export interface FollowRow {
	follower_id: string;
	following_id: string;
}

export interface Profile {
	user_id: string;
	username: string;
	display_name?: string;
	avatar_url?: string;
	banner_url?: string;
	bio?: string;
	created_at?: string;
	updated_at?: string;
}

export const useProfileStore = defineStore("profile", {
	state: () => ({
		myProfile: null as Profile | null,
		publicProfile: null as Profile | null,
		loading: false as boolean,
		error: null as string | null,
	}),
	actions: {
		async updateAndRefetchProfile(profile: Profile) {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const router = useRouter();
				let userId = profile.user_id;
				if (!userId || userId === "undefined") {
					const user = useSupabaseUser();
					if (user.value?.id) {
						userId = user.value.id;
					} else {
						throw new Error(
							"No valid user_id found for profile update."
						);
					}
				}

				const oldUsername = this.publicProfile?.username;
				const updateObj = {
					user_id: userId,
					username: profile.username?.toLowerCase() || "",
					display_name: profile.display_name,
					bio: profile.bio,
					avatar_url: profile.avatar_url,
					updated_at: new Date().toISOString(),
				};
				const { error } = await supabase
					.from("profiles")
					.update(updateObj as any)
					.eq("user_id", userId);
				if (error) throw error;

				const { data } = await supabase
					.from("profiles")
					.select("*")
					.eq("user_id", userId)
					.single();
				const profileData = data as Profile | null;
				this.publicProfile = profileData ?? null;

				if (
					oldUsername &&
					profileData?.username &&
					oldUsername !== profileData.username
				) {
					router.replace({
						path: ROUTES.PROFILE_USER(profileData.username),
					});
				}
			} catch (err) {
				this.error =
					(err as Error).message || "Failed to update profile";
			} finally {
				this.loading = false;
			}
		},
		async fetchProfileById(userId: string) {
			this.loading = true;
			this.error = null;
			try {
				const profile = await fetchProfileById(userId);
				this.myProfile = profile;
			} catch (err) {
				this.error =
					(err as Error).message || "Failed to fetch profile";
				this.myProfile = null;
			} finally {
				this.loading = false;
			}
		},

		async createProfile(
			userId: string,
			username: string,
			displayName?: string
		) {
			this.loading = true;
			this.error = null;
			try {
				const success = await createProfileUtil(
					userId,
					username,
					displayName
				);
				if (!success) throw new Error("Failed to create profile");
			} catch (err) {
				this.error =
					(err as Error).message || "Failed to create profile";
			} finally {
				this.loading = false;
			}
		},

		clearProfile() {
			this.myProfile = null;
			this.publicProfile = null;
			this.error = null;
			this.loading = false;
		},

		setMyProfile(profile: Profile) {
			this.myProfile = profile;
		},
		setPublicProfile(profile: Profile) {
			this.publicProfile = profile;
		},

		async saveMyProfile() {
			if (!this.myProfile) return;
			this.loading = true;
			this.error = null;
			try {
				const supabase: SupabaseClient = useSupabaseClient();
				const router = useRouter();

				const oldUsername = this.publicProfile?.username;

				const updateObj = {
					user_id: this.myProfile.user_id,
					username: this.myProfile.username?.toLowerCase() || "",
					display_name: this.myProfile.display_name,
					bio: this.myProfile.bio,
					avatar_url: this.myProfile.avatar_url,
					banner_url: this.myProfile.banner_url,
					updated_at: new Date().toISOString(),
				};
				const { error } = await supabase
					.from("profiles")
					.update(updateObj)
					.eq("user_id", this.myProfile.user_id);
				if (error) throw error;

				if (
					this.publicProfile &&
					this.publicProfile.user_id === this.myProfile.user_id
				) {
					this.publicProfile = { ...this.myProfile };

					if (
						oldUsername &&
						this.myProfile.username &&
						oldUsername !== this.myProfile.username
					) {
						await router.replace({
							path: ROUTES.PROFILE_USER(this.myProfile.username),
						});
					}
				}
			} catch (err) {
				this.error =
					(err as Error).message || "Failed to update profile";
			} finally {
				this.loading = false;
			}
		},
		async fetchProfileByUsername(username: string) {
			this.loading = true;
			this.error = null;
			try {
				const profile = await fetchProfileByUsername(username);
				this.publicProfile = profile;
			} catch (err) {
				this.error =
					(err as Error).message || "Failed to fetch profile";
				this.publicProfile = null;
			} finally {
				this.loading = false;
			}
		},

		async followUser(targetUserId: string) {
			const success = await followUserUtil(targetUserId);
			if (!success) {
				this.error = "Failed to follow user";
			}
		},

		async unfollowUser(targetUserId: string) {
			const success = await unfollowUserUtil(targetUserId);
			if (!success) {
				this.error = "Failed to unfollow user";
			}
		},

		async isFollowing(targetUserId: string): Promise<boolean> {
			return await isFollowingUtil(targetUserId);
		},

		async fetchFollowerCount(userId: string): Promise<number> {
			return await fetchFollowerCountUtil(userId);
		},

		async fetchFollowers(userId: string) {
			return await fetchFollowersUtil(userId);
		},

		async fetchFollows(userId: string) {
			return await fetchFollowsUtil(userId);
		},
	},
});
