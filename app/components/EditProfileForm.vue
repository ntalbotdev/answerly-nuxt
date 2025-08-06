<script setup lang="ts">
import { validateUsername } from "~/utils/profileUtils";

interface Profile {
	username?: string;
	display_name?: string;
	bio?: string;
	avatar_url?: string;
	banner_url?: string;
	[key: string]: unknown;
}

const user = useSupabaseUser();
const profileStore = useProfileStore();
const props = defineProps<{ profile: Profile }>();
const emit = defineEmits(["close", "profile-updated"]);

const avatarCompressor = ref();
const bannerCompressor = ref();

const form = reactive({
	user_id:
		typeof user.value?.id === "string"
			? user.value.id
			: typeof props.profile.user_id === "string"
				? props.profile.user_id
				: "",
	username: props.profile.username || "",
	display_name: props.profile.display_name || "",
	bio: props.profile.bio || "",
	avatar_url: props.profile.avatar_url || "",
	banner_url: props.profile.banner_url || "",
});
const loading = ref(false);
const error = ref("");

// Watch for changes in the profile prop to update the form
watch(
	() => props.profile,
	(newProfile) => {
		form.user_id =
			typeof user.value?.id === "string"
				? user.value.id
				: typeof newProfile.user_id === "string"
					? newProfile.user_id
					: "";
		form.username = newProfile.username || "";
		form.display_name = newProfile.display_name || "";
		form.bio = newProfile.bio || "";
		form.avatar_url = newProfile.avatar_url || "";
		form.banner_url = newProfile.banner_url || "";
	}
);

function triggerAvatarUpload() {
	avatarCompressor.value?.$el?.click();
}

function triggerBannerUpload() {
	bannerCompressor.value?.$el?.click();
}

async function handleAvatarCompressed(file: File) {
	if (!user.value?.id) return;
	const url = await uploadImage(file, "avatar");
	if (url) {
		form.avatar_url = url;
	}
}

async function handleBannerCompressed(file: File) {
	if (!user.value?.id) return;
	const url = await uploadImage(file, "banner");
	if (url) {
		form.banner_url = url;
	}
}

async function saveProfile() {
	loading.value = true;
	error.value = "";

	if (!user.value) {
		error.value = "You must be logged in to edit your profile.";
		loading.value = false;
		return;
	}

	const usernameValidation = validateUsername(form.username);
	if (!usernameValidation.valid) {
		error.value = usernameValidation.error || "Invalid username.";
		loading.value = false;
		return;
	}

	// Update the store's myProfile with form data, then save
	profileStore.setMyProfile({
		user_id: typeof user.value?.id === "string" ? user.value.id : "",
		username: form.username,
		display_name: form.display_name,
		bio: form.bio,
		avatar_url: form.avatar_url,
		banner_url: form.banner_url,
	});

	try {
		await profileStore.saveMyProfile();
		emit("profile-updated");
	} catch {
		error.value = "Failed to update profile";
	} finally {
		loading.value = false;
	}
}

function handleCancel() {
	emit("close");
}
</script>

<template>
	<form class="edit-profile" @submit.prevent="saveProfile">
		<div v-if="error" class="error-text">
			{{ error }}
		</div>
		<div class="edit-profile__field">
			<label for="username" class="edit-profile__label">Username</label>
			<input
				id="username"
				v-model="form.username"
				type="text"
				class="edit-profile__input"
				required
			/>
		</div>
		<div class="edit-profile__field">
			<label for="display-name" class="edit-profile__label">
				Display Name
			</label>
			<input
				id="display-name"
				v-model="form.display_name"
				type="text"
				class="edit-profile__input"
			/>
		</div>
		<div class="edit-profile__field">
			<label for="bio" class="edit-profile__label"> Bio </label>
			<textarea
				id="bio"
				v-model="form.bio"
				class="edit-profile__input"
				rows="4"
			/>
		</div>
		<div class="edit-profile__field">
			<div class="edit-profile__upload">
				<img
					v-if="form.avatar_url"
					:src="form.avatar_url"
					alt="Avatar preview"
					class="edit-profile__image-preview edit-profile__image-preview--avatar"
				/>
				<button
					type="button"
					class="edit-profile__upload-button edit-profile__upload-button--avatar"
					@click="triggerAvatarUpload"
				>
					Upload Avatar
				</button>
				<ImageCompressor
					ref="avatarCompressor"
					:max-width-or-height="400"
					:max-size-m-b="10"
					file-type="image/webp"
					class="hidden"
					@compressed="handleAvatarCompressed"
				/>
			</div>
		</div>
		<div class="edit-profile__field">
			<div class="edit-profile__upload">
				<img
					v-if="form.banner_url"
					:src="form.banner_url"
					alt="Banner preview"
					class="edit-profile__image-preview edit-profile__image-preview--banner"
				/>
				<button
					type="button"
					class="edit-profile__upload-button edit-profile__upload-button--banner"
					@click="triggerBannerUpload"
				>
					Upload Banner
				</button>
				<ImageCompressor
					ref="bannerCompressor"
					:max-width-or-height="1000"
					:max-size-m-b="10"
					file-type="image/webp"
					class="hidden"
					@compressed="handleBannerCompressed"
				/>
			</div>
		</div>
		<div class="edit-profile__button-wrapper">
			<button
				type="button"
				class="btn btn--secondary"
				@click="handleCancel"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="btn btn--primary"
				:disabled="loading || !form.username.trim()"
			>
				{{ loading ? "Saving..." : "Save Profile" }}
			</button>
		</div>
	</form>
</template>
