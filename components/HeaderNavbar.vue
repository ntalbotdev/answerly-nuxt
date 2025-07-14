<script setup lang="ts">
import { ROUTES } from "~/utils/routes";
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
			:to="ROUTES.DISCOVER"
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
			:to="ROUTES.NOTIFICATIONS"
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
			:to="ROUTES.LOGIN"
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
			:to="ROUTES.SIGNUP"
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
