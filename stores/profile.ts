export interface Profile {
    user_id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    created_at?: string;
    updated_at?: string;
}

export const useProfileStore = defineStore("profile", {
    // Define the store's state
    state: () => ({
        myProfile: null as Profile | null,
        publicProfile: null as Profile | null,
        loading: false as boolean,
        error: null as string | null,
    }),
    actions: {
        // Fetch profile by user ID
        async fetchProfileById(userId: string) {
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", userId)
                    .single();
                if (error) throw error;
                this.myProfile = data;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch profile";
                this.myProfile = null;
            } finally {
                this.loading = false;
            }
        },

        // Create a new profile
        async createProfile(userId: string, username: string) {
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
                const { error } = await supabase.from("profiles").insert([
                    {
                        user_id: userId,
                        username: username.toLowerCase(),
                    },
                ] as any);
                if (error) throw error;
            } catch (err: any) {
                this.error = err.message || "Failed to create profile";
            } finally {
                this.loading = false;
            }
        },

        // Clear the profile state
        clearProfile() {
            this.myProfile = null;
            this.publicProfile = null;
            this.error = null;
            this.loading = false;
        },

        // Set and get profile
        setMyProfile(profile: Profile) {
            this.myProfile = profile;
        },
        setPublicProfile(profile: Profile) {
            this.publicProfile = profile;
        },
        getMyProfile() {
            return this.myProfile;
        },
        getPublicProfile() {
            return this.publicProfile;
        },

        // update profile field
        updateMyProfileField<K extends keyof Profile>(
            field: K,
            value: Profile[K]
        ) {
            if (this.myProfile) {
                this.myProfile[field] = value;
            }
        },

        // update public profile field
        updatePublicProfileField<K extends keyof Profile>(
            field: K,
            value: Profile[K]
        ) {
            if (this.$state.publicProfile) {
                this.$state.publicProfile[field] = value;
            }
        },

        // Save the current user's profile
        async saveMyProfile() {
            if (!this.myProfile) return;
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        username: this.myProfile.username?.toLowerCase(),
                        bio: this.myProfile.bio,
                        avatar_url: this.myProfile.avatar_url,
                        updated_at: new Date().toISOString(),
                    } as any)
                    .eq("user_id", this.myProfile.user_id);
                if (error) throw error;
            } catch (err) {
                this.error =
                    (err as Error).message || "Failed to update profile";
            } finally {
                this.loading = false;
            }
        },

        // Fetch profile by username
        async fetchProfileByUsername(username: string) {
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("username", username)
                    .single();
                if (error) throw error;
                this.publicProfile = data;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch profile";
                this.publicProfile = null;
            } finally {
                this.loading = false;
            }
        },
        // Follow a user
        async followUser(targetUserId: string) {
            const user = useSupabaseUser();
            if (!user.value) return;
            const supabase = useSupabaseClient();
            const { error } = await supabase.from("follows").insert([
                {
                    follower_id: user.value.id,
                    following_id: targetUserId,
                },
            ]);
            if (error) this.error = error.message;
        },

        // Unfollow a user
        async unfollowUser(targetUserId: string) {
            const user = useSupabaseUser();
            if (!user.value) return;
            const supabase = useSupabaseClient();
            const { error } = await supabase
                .from("follows")
                .delete()
                .eq("follower_id", user.value.id)
                .eq("following_id", targetUserId);
            if (error) this.error = error.message;
        },

        // Check if current user follows target user
        async isFollowing(targetUserId: string): Promise<boolean> {
            const user = useSupabaseUser();
            if (!user.value) return false;
            const supabase = useSupabaseClient();
            const { data, error } = await supabase
                .from("follows")
                .select("follower_id")
                .eq("follower_id", user.value.id)
                .eq("following_id", targetUserId)
                .single();
            return !!data && !error;
        },

        // Fetch followers of a user
        async fetchFollowers(userId: string) {
            const supabase = useSupabaseClient();
            const { data, error } = await supabase
                .from("follows")
                .select(
                    "follower_id, profiles:follower_id(username, avatar_url, bio)"
                )
                .eq("following_id", userId);
            if (error) throw new Error(error.message);
            return data || [];
        },

        // Fetch users this user is following
        async fetchFollows(userId: string) {
            const supabase = useSupabaseClient();
            const { data, error } = await supabase
                .from("follows")
                .select(
                    "following_id, profiles:following_id(username, avatar_url, bio)"
                )
                .eq("follower_id", userId);
            if (error) throw new Error(error.message);
            return data || [];
        },
    },
});
