<script setup lang="ts">
interface ProfileData {
	username: string;
	avatar_url?: string;
	bio?: string;
	display_name?: string;
}

interface Props {
	profile: ProfileData;
	showBio?: boolean;
	size?: "small" | "medium" | "large";
}

const props = withDefaults(defineProps<Props>(), {
	showBio: true,
	size: "medium",
});

const avatarSize = computed(() => {
	switch (props.size) {
		case "small":
			return "w-8 h-8";
		case "large":
			return "w-16 h-16";
		default:
			return "w-12 h-12";
	}
});
</script>

<template>
	<div class="profile-card" :class="`profile-card--${size}`">
		<div class="profile-card__avatar">
			<img
				v-if="profile.avatar_url"
				:src="profile.avatar_url"
				:alt="`${profile.username} avatar`"
				:class="avatarSize"
				class="profile-card__avatar-img"
			/>
			<div
				v-else
				:class="avatarSize"
				class="profile-card__avatar-placeholder"
			>
				{{ profile.username?.charAt(0).toUpperCase() }}
			</div>
		</div>

		<div class="profile-card__info">
			<div class="profile-card__name">
				<div class="profile-card__display-name">
					{{ profile.display_name || profile.username }}
				</div>
				<div class="profile-card__username">
					@{{ profile.username }}
				</div>
			</div>

			<p v-if="showBio && profile.bio" class="profile-card__bio">
				{{ profile.bio }}
			</p>

			<NuxtLink
				:to="ROUTES.PROFILE_USER(profile.username)"
				class="profile-card__link btn btn--primary"
			>
				View Profile
			</NuxtLink>
		</div>
	</div>
</template>
