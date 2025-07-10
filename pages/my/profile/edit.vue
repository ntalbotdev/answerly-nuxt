<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
const profileStore = useProfileStore();
const user = useSupabaseUser();
const router = useRouter();
const supabase = useSupabaseClient();

const form = ref({
    username: "",
    bio: "",
    avatar_url: "",
});

const loading = ref(false);
const error = ref("");
const uploading = ref(false);

onMounted(async () => {
    if (user.value) {
        await profileStore.fetchProfileById(user.value.id);
        if (profileStore.myProfile) {
            form.value.username = profileStore.myProfile.username || "";
            form.value.bio = profileStore.myProfile.bio || "";
            form.value.avatar_url = profileStore.myProfile.avatar_url || "";
        }
    }
});

async function handleAvatarUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || !target.files[0] || !user.value) return;
    const file = target.files[0];
    const fileExt = file.name.split(".").pop();
    // Store in a folder named after the user's UUID
    const filePath = `${user.value.id}/avatar.${fileExt}`;
    uploading.value = true;
    error.value = "";
    try {
        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
        if (!data.publicUrl) throw new Error("Failed to get public URL");
        form.value.avatar_url = data.publicUrl;
    } catch (e) {
        error.value = (e as Error).message || "Failed to upload avatar.";
    } finally {
        uploading.value = false;
    }
}

async function saveProfile() {
    loading.value = true;
    error.value = "";
    try {
        // Update local state
        profileStore.updateMyProfileField("username", form.value.username);
        profileStore.updateMyProfileField("bio", form.value.bio);
        profileStore.updateMyProfileField("avatar_url", form.value.avatar_url);
        // Persist to Supabase
        await profileStore.saveMyProfile();
        router.push("/my/profile");
    } catch (e) {
        error.value = (e as Error).message || "Failed to update profile.";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div>
        <h1>Edit Profile</h1>
        <form @submit.prevent="saveProfile">
            <div>
                <label>Username</label>
                <input v-model="form.username" required />
            </div>
            <div>
                <label>Bio</label>
                <textarea v-model="form.bio" />
            </div>
            <div>
                <label>Avatar</label>
                <input
                    type="file"
                    accept="image/*"
                    @change="handleAvatarUpload"
                    :disabled="uploading"
                />
                <div v-if="form.avatar_url">
                    <img
                        :src="form.avatar_url"
                        alt="Avatar Preview"
                        style="
                            max-width: 200px;
                            max-height: 200px;
                        "
                    />
                </div>
            </div>
            <div v-if="uploading">Uploading avatar...</div>
            <div v-if="error" style="color: red">{{ error }}</div>
            <button type="submit" :disabled="loading">Save</button>
            <button type="button" @click="router.push('/my/profile')">
                Cancel
            </button>
        </form>
    </div>
</template>