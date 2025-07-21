import { defineStore } from "pinia";

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

        async createProfile(userId: string, username: string, displayName?: string) {
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
                const profileData: any = {
                    user_id: userId,
                    username: username.toLowerCase(),
                };
                
                if (displayName) {
                    profileData.display_name = displayName;
                } else {
                    profileData.display_name = username;
                }
                const { error } = await supabase.from("profiles").insert([profileData]);
                if (error) throw error;
            } catch (err: any) {
                this.error = err.message || "Failed to create profile";
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
        getMyProfile() {
            return this.myProfile;
        },
        getPublicProfile() {
            return this.publicProfile;
        },
        
        updateMyProfileField<K extends keyof Profile>(
            field: K,
            value: Profile[K]
        ) {
            if (this.myProfile) {
                this.myProfile[field] = value;
            }
        },

        updatePublicProfileField<K extends keyof Profile>(
            field: K,
            value: Profile[K]
        ) {
            if (this.$state.publicProfile) {
                this.$state.publicProfile[field] = value;
            }
        },

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
                        display_name: this.myProfile.display_name,
                        bio: this.myProfile.bio,
                        avatar_url: this.myProfile.avatar_url,
                        banner_url: this.myProfile.banner_url,
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

        async fetchFollowerCount(userId: string): Promise<number> {
            const supabase = useSupabaseClient();
            const { count, error } = await supabase
                .from("follows")
                .select("follower_id", { count: "exact", head: true })
                .eq("following_id", userId);
            if (error) return 0;
            return count || 0;
        },

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
