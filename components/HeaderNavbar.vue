<script setup lang="ts">
import HeaderUserDropdown from "~/components/HeaderUserDropdown.vue";
const user = useSupabaseUser();
</script>

<template>
	<nav class="header__nav">
		<template v-if="user">
			<NuxtLink
				to="/"
				:class="[
					'header__nav-link',
					$route.path === '/' ? 'header__nav-link--active' : '',
				]"
			>
				<Icon name="bx:globe" class="header__nav-link-icon" />
				Feed
			</NuxtLink>
			<NuxtLink
				to="/discover"
				:class="[
					'header__nav-link',
					$route.path === '/discover'
						? 'header__nav-link--active'
						: '',
				]"
			>
				<Icon name="bx:search" class="header__nav-link-icon" />
				Discover
			</NuxtLink>
			<NuxtLink
				to="/notifications"
				:class="[
					'header__nav-link',
					$route.path === '/notifications'
						? 'header__nav-link--active'
						: '',
				]"
			>
				<Icon name="bx:bell" class="header__nav-link-icon" />
				Notifications
			</NuxtLink>

			<HeaderUserDropdown />
		</template>
		<template v-else-if="!user">
			<NuxtLink
				to="/auth/login"
				:class="[
					'header__nav-link',
					$route.path === '/auth/login'
						? 'header__nav-link--active'
						: '',
				]"
			>
				Log in
			</NuxtLink>
			<NuxtLink
				to="/auth/signup"
				:class="[
					'header__nav-link',
					$route.path === '/auth/signup'
						? 'header__nav-link--active'
						: '',
				]"
			>
				Sign up
			</NuxtLink>
		</template>
	</nav>
</template>
