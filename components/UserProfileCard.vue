<template>
	<div class="mb-8 flex flex-col items-center gap-6 p-8">
		<NuxtLink
			:to="`/profile/${profile.username}`"
			class="text-xl font-bold tracking-wide text-indigo-700 underline-offset-4 transition-colors hover:underline dark:text-indigo-600"
		>
			{{ profile.username }}
		</NuxtLink>
		<div class="relative">
			<img
				v-if="profile.avatar_url"
				:src="profile.avatar_url"
				alt="Avatar"
				class="h-36 w-36 rounded-full border-4 border-blue-200 bg-white/60 object-cover shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105"
			/>
			<span
				v-else
				class="flex h-36 w-36 items-center justify-center rounded-full border-4 border-blue-200 bg-white/60 text-5xl font-bold text-indigo-400 shadow-lg backdrop-blur-md"
			>
				{{ profile.username?.charAt(0).toUpperCase() }}
			</span>
			<span
				class="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow ring-2 ring-blue-200 backdrop-blur-md"
			>
				<Icon
					name="heroicons:user-circle-20-solid"
					class="h-5 w-5 text-indigo-400"
				/>
			</span>
		</div>
		<div class="text-center">
			<h2
				class="mb-2 text-3xl font-extrabold tracking-tight text-indigo-800 drop-shadow-sm dark:text-indigo-700"
			>
				{{ profile.display_name || profile.username }}
			</h2>
			<div
				v-if="profile.bio"
				class="mx-auto mt-1 max-w-xs text-base italic text-gray-500 dark:text-gray-600"
			>
				{{ profile.bio }}
			</div>
		</div>
		<div class="mt-2 flex flex-col gap-4">
			<div class="flex items-center justify-center text-sm text-gray-500">
				<slot name="mutual-status" />
			</div>
			<div class="flex items-center gap-2">
				<NuxtLink
					:to="`/profile/${profile.username}/followers`"
					class="flex items-center gap-1 rounded-2xl border border-blue-100 bg-white/40 px-4 py-1.5 text-sm text-blue-700 shadow backdrop-blur-md transition-all hover:bg-white/70 hover:text-indigo-800 hover:shadow-lg"
				>
					<Icon
						name="heroicons:user-group-20-solid"
						class="mr-1 h-5 w-5 text-indigo-400"
					/>
					<FollowerCount :user-id="profile.user_id" />
				</NuxtLink>
				<NuxtLink
					:to="`/profile/${profile.username}/following`"
					class="flex items-center gap-1 rounded-2xl border border-blue-100 bg-white/40 px-4 py-1.5 text-sm text-blue-700 shadow backdrop-blur-md transition-all hover:bg-white/70 hover:text-indigo-800 hover:shadow-lg"
				>
					<Icon
						name="heroicons:user-20-solid"
						class="mr-1 h-5 w-5 text-indigo-400"
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
