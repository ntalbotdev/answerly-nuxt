<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";

const profileStore = useProfileStore();
const user = useSupabaseUser();
const router = useRouter();
const supabase = useSupabaseClient();
const form = ref({
    username: "",
    displayName: "",
    bio: "",
    avatar_url: "",
    banner_url: "",
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
            form.value.displayName = profileStore.myProfile.display_name || "";
            form.value.bio = profileStore.myProfile.bio || "";
            form.value.avatar_url = profileStore.myProfile.avatar_url || "";
            form.value.banner_url = profileStore.myProfile.banner_url || "";
        }
    }
});

async function handleAvatarUpload(file: File) {
    if (!user.value) return;
    const filePath = `${user.value.id}/avatar.webp`;
    uploading.value = true;
    error.value = "";
    try {
        // Remove avatar.webp before uploading new avatar
        const userId = user.value?.id;
        const { data: listData, error: listError } = await supabase.storage
            .from("profile-assets")
            .list(userId + "/");
        if (listError) throw listError;
        if (listData && userId) {
            const avatarFile = listData.find(f => f.name === "avatar.webp");
            if (avatarFile) {
                await supabase.storage.from("profile-assets").remove([`${userId}/avatar.webp`]);
            }
        }
        // Upload new avatar.webp
        const { error: uploadError } = await supabase.storage
            .from("profile-assets")
            .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data } = supabase.storage
            .from("profile-assets")
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

async function handleBannerUpload(file: File) {
    if (!user.value) return;
    const filePath = `${user.value.id}/banner.webp`;
    uploading.value = true;
    error.value = "";
    try {
        // Remove old banner if exists
        const userId = user.value?.id;
        const { data: listData, error: listError } = await supabase.storage
            .from("profile-assets")
            .list(userId + "/");
        if (listError) throw listError;
        if (listData && userId) {
            const bannerFile = listData.find(f => f.name === "banner.webp");
            if (bannerFile) {
                await supabase.storage.from("profile-assets").remove([`${userId}/banner.webp`]);
            }
        }
        // Upload new banner.webp
        const { error: uploadError } = await supabase.storage
            .from("profile-assets")
            .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        // Get public URL
        const { data } = supabase.storage
            .from("profile-assets")
            .getPublicUrl(filePath);
        if (!data.publicUrl) throw new Error("Failed to get public URL");
        form.value.banner_url = data.publicUrl + "?t=" + Date.now();
    } catch (e) {
        error.value = (e as Error).message || "Failed to upload banner.";
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
        profileStore.updateMyProfileField("display_name", form.value.displayName);
        profileStore.updateMyProfileField("bio", form.value.bio);
        profileStore.updateMyProfileField("avatar_url", form.value.avatar_url);
        profileStore.updateMyProfileField("banner_url", form.value.banner_url);
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
                <input v-model="form.username" disabled />
            </div>
            <div>
                <label>Display Name</label>
                <input v-model="form.displayName" required />
            </div>
            <div>
                <label>Bio</label>
                <textarea v-model="form.bio" />
            </div>
            <div>
                <label>Avatar</label>
                <ImageCompressor
                    :disabled="uploading"
                    :max-width-or-height="200"
                    file-type="image/webp"
                    @compressed="handleAvatarUpload"
                />
                <div v-if="form.avatar_url">
                    <img :src="form.avatar_url" alt="Avatar Preview" />
                </div>
            </div>
            <div>
                <label>Banner</label>
                <ImageCompressor
                    :disabled="uploading"
                    :max-width-or-height="600"
                    file-type="image/webp"
                    @compressed="handleBannerUpload"
                />
                <div v-if="form.banner_url">
                    <img :src="form.banner_url" alt="Banner Preview" />
                </div>
            </div>
            <div v-if="uploading">Uploading...</div>
            <div v-if="error" style="color: red">{{ error }}</div>
            <button type="submit" :disabled="loading">Save</button>
            <button type="button" @click="router.push('/my/profile')">
                Cancel
            </button>
        </form>
    </div>
</template>
