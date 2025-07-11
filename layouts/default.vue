<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const profileStore = useProfileStore();
const router = useRouter();
const isDropdownOpen = ref(false);

// Close dropdown on outside click
function handleClickOutside(event: MouseEvent) {
	const dropdown = document.getElementById("navbar-user-dropdown");
	if (dropdown && !dropdown.contains(event.target as Node)) {
		isDropdownOpen.value = false;
	}
}
onMounted(() => {
	document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
});

// Fetch profile on login, clear on logout
watchEffect(async () => {
	if (user.value) {
		if (
			!profileStore.myProfile ||
			profileStore.myProfile.user_id !== user.value.id
		) {
			await profileStore.fetchProfileById(user.value.id);
		}
	} else {
		profileStore.clearProfile();
	}
});

// Logout function
const logout = async () => {
	await supabase.auth.signOut();
	profileStore.clearProfile();
	router.push("/auth/login");
};
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<nav class="bg-white shadow">
			<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 items-center justify-between">
					<!-- Logo and Home -->
					<div class="flex items-center gap-4">
						<NuxtLink
							to="/"
							class="flex items-center gap-2 text-xl font-bold text-blue-600"
						>
							<Icon
								name="heroicons:chat-bubble-left-20-solid"
								class="h-6 w-6 text-blue-500"
							/>
							Answerly
						</NuxtLink>
					</div>
					<!-- Main navigation links -->
					<div class="flex items-center gap-4">
						<span v-if="profileStore.loading" class="text-gray-400">Loading...</span>
						<span v-else-if="profileStore.error" class="text-red-500">{{ profileStore.error }}</span>
						<template v-if="user">
							<div id="navbar-user-dropdown" class="relative">
								<button
									type="button"
									class="flex items-center gap-2 rounded bg-gray-100 px-3 py-1 text-gray-700 transition hover:bg-gray-200"
									@click="isDropdownOpen = !isDropdownOpen"
								>
									<template v-if="profileStore.myProfile?.avatar_url">
										<img
											:src="profileStore.myProfile.avatar_url"
											alt="avatar"
											class="h-5 w-5 rounded-full object-cover"
										>
									</template>
									<template v-else>
										<Icon name="heroicons:user-20-solid" class="h-5 w-5" />
									</template>
									<span class="font-semibold">{{ profileStore.myProfile?.display_name || profileStore.myProfile?.username }}</span>
									<Icon name="heroicons:chevron-down-16-solid" class="h-4 w-4 text-gray-400" />
								</button>
								<div v-if="isDropdownOpen" class="absolute right-0 z-10 mt-2 w-48 rounded border border-gray-200 bg-white shadow-lg">
									<NuxtLink to="/my/profile" class="block px-4 py-2 hover:bg-gray-100" @click="isDropdownOpen = false">My Profile</NuxtLink>
									<NuxtLink to="/my/inbox" class="block px-4 py-2 hover:bg-gray-100" @click="isDropdownOpen = false">My Inbox</NuxtLink>
									<NuxtLink to="/my/asked" class="block px-4 py-2 hover:bg-gray-100" @click="isDropdownOpen = false">My Asked Questions</NuxtLink>
                                    <NuxtLink to="/my/settings" class="block px-4 py-2 hover:bg-gray-100" @click="isDropdownOpen = false">My Settings</NuxtLink>
									<button type="button" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 flex items-center gap-2" @click="async () => { await logout(); isDropdownOpen = false; }">
										<Icon name="heroicons:arrow-right-on-rectangle-20-solid" class="h-5 w-5" />
										Logout
									</button>
								</div>
							</div>
						</template>
						<template v-else-if="!user">
							<NuxtLink to="/auth/login" class="hover:text-blue-500">Log In</NuxtLink>
							<NuxtLink to="/auth/signup" class="hover:text-blue-500">Sign Up</NuxtLink>
						</template>
					</div>
				</div>
			</div>
		</nav>
		<main class="mx-auto max-w-4xl p-4">
			<NuxtPage />
		</main>
	</div>
</template>
