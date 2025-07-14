<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
import { ROUTES } from "~/utils/routes";
const profileStore = useProfileStore();
const dropdownRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);
const emit = defineEmits(["close"]);

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

function handleDropdownLinkClick() {
	isDropdownOpen.value = false;
	emit("close");
}

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
				:to="ROUTES.INBOX"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/my/inbox'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="handleDropdownLinkClick"
			>
				Inbox
			</NuxtLink>

<NuxtLink
				:to="ROUTES.PROFILE"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/my/profile'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="handleDropdownLinkClick"
			>
				My Profile
			</NuxtLink>

<NuxtLink
				:to="ROUTES.QUESTIONS"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/my/questions'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="handleDropdownLinkClick"
			>
				My Questions
			</NuxtLink>

<NuxtLink
				:to="ROUTES.SETTINGS"
				:class="[
					'header__user-dropdown-link',
					$route.path === '/settings'
						? 'header__user-dropdown-link--active'
						: '',
				]"
				@click="handleDropdownLinkClick"
			>
				Settings
			</NuxtLink>

			<LogoutButton
				@click="handleDropdownLinkClick"
			/>
		</div>
	</div>
</template>
