<script setup lang="ts">
const user = useSupabaseUser();
const notificationsStore = useNotificationsStore();
</script>

<template>
	<nav class="header__nav">
		<template v-if="user">
			<NuxtLink
				:to="ROUTES.HOME"
				:class="[
					'header__nav-link',
					$route.path === ROUTES.HOME
						? 'header__nav-link--active'
						: '',
				]"
			>
				<Icon name="bx:globe" class="header__nav-link-icon" />
				Feed
			</NuxtLink>
			<NuxtLink
				:to="ROUTES.DISCOVER"
				:class="[
					'header__nav-link',
					$route.path === ROUTES.DISCOVER
						? 'header__nav-link--active'
						: '',
				]"
			>
				<Icon name="bx:search" class="header__nav-link-icon" />
				Discover
			</NuxtLink>

			<NuxtLink
				:to="ROUTES.NOTIFICATIONS"
				:class="[
					'header__nav-link',
					$route.path === ROUTES.NOTIFICATIONS
						? 'header__nav-link--active'
						: '',
				]"
			>
				<Icon name="bx:bell" class="header__nav-link-icon" />
				Notifications
				<span
					v-if="notificationsStore.unreadCount > 0"
					class="notification-badge notification-badge--absolute"
				>
					{{ notificationsStore.unreadCount }}
				</span>
			</NuxtLink>

			<HeaderUserDropdown />
		</template>
		<template v-else-if="!user">
			<NuxtLink
				:to="ROUTES.LOGIN"
				:class="[
					'header__nav-link',
					$route.path === ROUTES.LOGIN
						? 'header__nav-link--active'
						: '',
				]"
			>
				Log in
			</NuxtLink>
			<NuxtLink
				:to="ROUTES.SIGNUP"
				:class="[
					'header__nav-link',
					$route.path === ROUTES.SIGNUP
						? 'header__nav-link--active'
						: '',
				]"
			>
				Sign up
			</NuxtLink>
		</template>
	</nav>
</template>
