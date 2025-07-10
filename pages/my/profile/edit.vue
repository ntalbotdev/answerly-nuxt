<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
import imageCompression from "browser-image-compression";

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

definePageMeta({
    // This page requires authentication
    middleware: "auth",
});

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
    let file = target.files[0];
    const options = {
        maxSizeMB: 10, // Large enough to always trigger processing
        maxWidthOrHeight: 200,
        useWebWorker: true,
        fileType: "image/webp",
    };
    file = await imageCompression(file, options);
    // Always use webp extension
    const filePath = `${user.value.id}/avatar.webp`;
    uploading.value = true;
    error.value = "";
    try {
        // Remove ALL files in the user's folder before uploading new avatar
        const userId = user.value?.id;
        const { data: listData, error: listError } = await supabase.storage
            .from("avatars")
            .list(userId + "/");
        if (listError) throw listError;
        if (listData && listData.length > 0 && userId) {
            const filesToDelete = listData.map((f) => `${userId}/${f.name}`);
            await supabase.storage.from("avatars").remove(filesToDelete);
        }
        // Upload new avatar.webp (no old files remain, so no cache/collision)
        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
        if (!data.publicUrl) throw new Error("Failed to get public URL");
        // Add cache-busting query param to force browser refresh
        form.value.avatar_url = data.publicUrl + "?t=" + Date.now();
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
                    :disabled="uploading"
                    @change="handleAvatarUpload"
                />
                <div v-if="form.avatar_url">
                    <img :src="form.avatar_url" alt="Avatar Preview" />
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
