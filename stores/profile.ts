interface Profile {
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
                        username: username,
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
            if (this.publicProfile) {
                this.publicProfile[field] = value;
            }
        },

        // Persist profile changes to Supabase
        async saveMyProfile() {
            if (!this.myProfile) return;
            this.loading = true;
            this.error = null;
            try {
                const supabase = useSupabaseClient();
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        username: this.myProfile.username,
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
    },
});
