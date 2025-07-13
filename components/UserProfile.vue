<script setup lang="ts">
defineProps<{ profile: any}>();
</script>

<template>
	<div class="profile">
	<div class="profile__header">
		<div v-if="profile.banner_url" class="profile__banner">
			<div class="profile__actions">
				<div class="profile__action">
					<NuxtLink
						:to="`/my/profile/edit`"
						class="btn"
					>
						<Icon name="bx:edit" />
						<span class="profile__action-text">Edit Profile</span>
					</NuxtLink>
				</div>
			</div>

			<img
				:src="profile.banner_url"
				alt="Banner"
				class="profile__banner-img"
			>
		</div>
			<img
				v-if="profile.avatar_url"
				:src="profile.avatar_url"
				alt="Avatar"
				class="profile__avatar"
			>
			<span
				v-else
				class="profile__avatar profile__avatar--placeholder"
			>
				{{ profile.username?.charAt(0).toUpperCase() }}
			</span>
		</div>

		<div class="profile__name-wrapper">
			<h2 class="profile__name">
				{{ profile.display_name || profile.username }}
			</h2>
			<span class="profile__user-url">
				@{{ profile.username }}
			</span>
		</div>

		<div v-if="profile.bio" class="profile__bio">
			{{ profile.bio }}
		</div>
		<div class="profile__stats">
			<div class="profile__stats-mutual-status">
				<slot name="mutual-status" />
			</div>
			<div class="profile__stats-follow-count-wrapper">
				<NuxtLink
					:to="`/profile/${profile.username}/followers`"
					class="profile__stats-follow-count"
				>
					<Icon
						name="bx:group"
						class="profile__stats-icon"
					/>
					<FollowerCount :user-id="profile.user_id" />
				</NuxtLink>
				<NuxtLink
					:to="`/profile/${profile.username}/following`"
					class="profile__stats-follow-count"
				>
					<Icon
						name="bx:user"
						class="profile__stats-icon"
					/>
					<FollowingCount :user-id="profile.user_id" />
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
