<template>
	<div class="mb-8 flex flex-col items-center gap-6 p-8">
		<NuxtLink
			:to="`/profile/${profile.username}`"
			class="text-xl font-bold tracking-wide hover:underline"
		>
			{{ profile.username }}
		</NuxtLink>
		<div class="relative">
			<img
				v-if="profile.avatar_url"
				:src="profile.avatar_url"
				alt="Avatar"
				class="h-36 w-36 rounded-full object-cover shadow-lg transition-transform duration-300 hover:scale-105"
			/>
			<span
				v-else
				class="flex h-36 w-36 items-center justify-center rounded-full text-5xl font-bold shadow-lg"
			>
				{{ profile.username?.charAt(0).toUpperCase() }}
			</span>
		</div>
		<div class="text-center">
			<h2
				class="mb-2 text-3xl font-extrabold tracking-tight drop-shadow-sm"
			>
				{{ profile.display_name || profile.username }}
			</h2>
			<div
				v-if="profile.bio"
				class="mx-auto mt-1 max-w-xs text-base italic"
			>
				{{ profile.bio }}
			</div>
		</div>
		<div class="mt-2 flex flex-col gap-4">
			<div class="flex items-center justify-center text-sm">
				<slot name="mutual-status" />
			</div>
			<div class="flex items-center gap-2">
				<NuxtLink
					:to="`/profile/${profile.username}/followers`"
					class="flex items-center gap-1 px-4 py-1.5 text-sm"
				>
					<Icon
						name="bx:group"
						class="mr-1 h-5 w-5"
					/>
					<FollowerCount :user-id="profile.user_id" />
				</NuxtLink>
				<NuxtLink
					:to="`/profile/${profile.username}/following`"
					class="flex items-center gap-1 px-4 py-1.5 text-sm"
				>
					<Icon
						name="bx:user"
						class="mr-1 h-5 w-5"
					/>
					<FollowingCount :user-id="profile.user_id" />
				</NuxtLink>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{ profile: any }>();
</script>
