<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";

interface Profile {
	username?: string;
	display_name?: string;
	bio?: string;
	avatar_url?: string;
	banner_url?: string;
	[key: string]: unknown;
}

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const profileStore = useProfileStore();
const props = defineProps<{ profile: Profile }>();
const emit = defineEmits(["close", "updated"]);
const avatarFileInput = ref<HTMLInputElement>();
const bannerFileInput = ref<HTMLInputElement>();

const form = reactive({
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
		form.username = newProfile.username || "";
		form.display_name = newProfile.display_name || "";
		form.bio = newProfile.bio || "";
		form.avatar_url = newProfile.avatar_url || "";
		form.banner_url = newProfile.banner_url || "";
	},
);

// Function to trigger avatar file input
function triggerAvatarUpload() {
	avatarFileInput.value?.click();
}

// Function to trigger banner file input
function triggerBannerUpload() {
	bannerFileInput.value?.click();
}

// Handle avatar file selection and compression
async function handleAvatarFileChange(event: Event) {
	const target = event.target as HTMLInputElement;
	if (!target.files || !target.files[0]) return;

	const file = target.files[0];
	console.log("Avatar file selected:", file.name, file.size);

	// Compress the image using the same logic as ImageCompressor
	const imageCompression = (await import("browser-image-compression"))
		.default;
	const options = {
		maxSizeMB: 10,
		maxWidthOrHeight: 400,
		useWebWorker: true,
		fileType: "image/webp",
	};

	try {
		const compressedFile = await imageCompression(file, options);
		await handleAvatarCompressed(compressedFile);
	} catch (error) {
		console.error("Avatar compression error:", error);
	}
}

// Handle banner file selection and compression
async function handleBannerFileChange(event: Event) {
	const target = event.target as HTMLInputElement;
	if (!target.files || !target.files[0]) return;

	const file = target.files[0];
	console.log("Banner file selected:", file.name, file.size);

	// Compress the image using the same logic as ImageCompressor
	const imageCompression = (await import("browser-image-compression"))
		.default;
	const options = {
		maxSizeMB: 10,
		maxWidthOrHeight: 1000, // Larger for banner
		useWebWorker: true,
		fileType: "image/webp",
	};

	try {
		const compressedFile = await imageCompression(file, options);
		await handleBannerCompressed(compressedFile);
	} catch (error) {
		return `Banner compression error: ${error}`;
	}
}

async function uploadImage(file: File, type: "avatar" | "banner") {
	if (!user.value) {
		console.error("No user found");
		return null;
	}

	const filePath = `${user.value.id}/${type}.webp`;

	try {
		const { error } = await supabase.storage
			.from("profile-assets")
			.upload(filePath, file, {
				upsert: true,
				contentType: file.type,
			});

		if (error) {
			console.error("Upload error:", error);
			return null;
		}

		const { data } = supabase.storage
			.from("profile-assets")
			.getPublicUrl(filePath);
		console.log("Upload successful, public URL:", data?.publicUrl);
		const urlWithTimestamp = data?.publicUrl
			? `${data.publicUrl}?t=${Date.now()}`
			: null;
		return urlWithTimestamp;
	} catch (err) {
		console.error("Upload exception:", err);
		return null;
	}
}

async function handleAvatarCompressed(file: File) {
	console.log("Avatar compressed:", file);
	const url = await uploadImage(file, "avatar");
	if (url) {
		console.log("Avatar uploaded, updating form");
		form.avatar_url = url;
	}
}

async function handleBannerCompressed(file: File) {
	console.log("Banner compressed:", file);
	const url = await uploadImage(file, "banner");
	if (url) {
		console.log("Banner uploaded, updating form");
		form.banner_url = url;
	}
}

// Function to handle form submission
async function saveProfile() {
	loading.value = true;
	error.value = "";

	if (!user.value) {
		error.value = "You must be logged in to edit your profile.";
		loading.value = false;
		return;
	}

	try {
		profileStore.updateMyProfileField("username", form.username);
		profileStore.updateMyProfileField("display_name", form.display_name);
		profileStore.updateMyProfileField("bio", form.bio);
		profileStore.updateMyProfileField("avatar_url", form.avatar_url);
		profileStore.updateMyProfileField("banner_url", form.banner_url);
		await profileStore.saveMyProfile();
		emit("updated");
		emit("close");
	} catch {
		error.value = "Failed to update profile";
	} finally {
		loading.value = false;
	}
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
			<label for="display-name" class="edit-profile__label"
				>Display Name</label
			>
			<input
				id="display-name"
				v-model="form.display_name"
				type="text"
				class="edit-profile__input"
			/>
		</div>

		<div class="edit-profile__field">
			<label for="bio" class="edit-profile__label">Bio</label>
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

				<input
					ref="avatarFileInput"
					type="file"
					accept="image/*"
					class="hidden"
					@change="handleAvatarFileChange"
				/>
			</div>
		</div>

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

			<input
				ref="bannerFileInput"
				type="file"
				accept="image/*"
				class="hidden"
				@change="handleBannerFileChange"
			/>
		</div>

		<div class="edit-profile__button-wrapper">
			<button
				class="edit-profile__button edit-profile__button--cancel"
				@click="$emit('close')"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="edit-profile__button edit-profile__button--submit"
				:disabled="loading || !form.username.trim()"
			>
				{{ loading ? "Saving..." : "Save Profile" }}
			</button>
		</div>
	</form>
</template>
