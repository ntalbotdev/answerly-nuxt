import { defineStore } from "pinia";

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
    state: () => ({
        profile: null as Profile | null,
        loading: false as boolean,
        error: null as string | null,
    }),
    actions: {
        async fetchProfile(userId: string) {
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
                this.profile = data;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch profile";
                this.profile = null;
            } finally {
                this.loading = false;
            }
        },

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

        clearProfile() {
            this.profile = null;
            this.error = null;
            this.loading = false;
        },

        setProfile(profile: Profile) {
            this.profile = profile;
        },
        getProfile() {
            return this.profile;
        },
        updateProfileField<K extends keyof Profile>(
            field: K,
            value: Profile[K]
        ) {
            if (this.profile) {
                this.profile[field] = value;
            }
        },
    },
});
