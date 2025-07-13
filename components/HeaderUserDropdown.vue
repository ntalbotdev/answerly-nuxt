<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
const profileStore = useProfileStore();
const router = useRouter();
const dropdownRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);

const handleClickOutside = (event: MouseEvent) => {
	if (
		dropdownRef.value &&
		!dropdownRef.value.contains(event.target as Node)
	) {
		isDropdownOpen.value = false;
	}
};
onMounted(() => {
	window.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
	window.removeEventListener("click", handleClickOutside);
});

const logout = async () => {
	const supabase = useSupabaseClient();
	await supabase.auth.signOut();
	profileStore.clearProfile();
	router.push("/auth/login");
};
</script>

<template>
	<div ref="dropdownRef" class="header__user-dropdown">
		<button
			type="button"
			class="header__user-dropdown-button"
			@click="isDropdownOpen = !isDropdownOpen"
		>
			<div class="header__user-dropdown-avatar">
				<template v-if="profileStore.myProfile?.avatar_url">
					<img
						:src="profileStore.myProfile.avatar_url"
						alt="Avatar"
					/>
				</template>
				<template v-else>
					<Icon name="bx:user" class="header__icon" />
				</template>
			</div>
			<span class="header__user-dropdown-name">
				{{
					profileStore.myProfile?.display_name ||
					profileStore.myProfile?.username
				}}
			</span>
			<Icon name="bx:chevron-down" class="header__user-dropdown-icon" />
		</button>
		<div v-if="isDropdownOpen" class="header__user-dropdown-menu">
			<NuxtLink
				to="/my/inbox"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/my/inbox'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="isDropdownOpen = false"
			>
				Inbox
			</NuxtLink>
			<NuxtLink
				to="/my/profile"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/my/profile'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="isDropdownOpen = false"
			>
				My Profile
			</NuxtLink>
			<NuxtLink
				to="/my/questions"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/my/questions'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="isDropdownOpen = false"
			>
				My Questions
			</NuxtLink>
			<NuxtLink
				to="/my/settings"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/my/settings'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="isDropdownOpen = false"
			>
				Settings
			</NuxtLink>
			<button
				class="header__user-dropdown-link--logout"
				type="button"
				@click="
					async () => {
						await logout();
						isDropdownOpen = false;
					}
				"
			>
				<Icon name="bx:log-out" class="header__icon" />
				Logout
			</button>
		</div>
	</div>
</template>
