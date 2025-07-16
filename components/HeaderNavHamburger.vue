<script setup lang="ts">
import { ROUTES } from "~/utils/routes";
import { storeToRefs } from "pinia";
import { useQuestionsStore } from "~/stores/questions";
const questionsStore = useQuestionsStore();
const { hasNewInboxItems, newInboxCount } = storeToRefs(questionsStore);
const showMenu = ref(false);
const user = useSupabaseUser();
const route = useRoute();

function toggleMenu() {
	showMenu.value = !showMenu.value;
	if (showMenu.value) {
		document.body.style.overflow = "hidden";
	} else {
		document.body.style.overflow = "";
	}
}

function closeMenu() {
	showMenu.value = false;
	document.body.style.overflow = "";
}

onUnmounted(() => {
	document.body.style.overflow = "";
});
</script>

<template>
	<div class="header__nav-hamburger">
		<button
			class="header__nav-hamburger-button"
			:aria-expanded="showMenu"
			aria-label="Open navigation menu"
			@click="toggleMenu"
		>
			<Icon name="bx:menu" class="header__nav-hamburger-icon" />
		</button>

		<transition name="fade">
			<div v-if="showMenu" class="header__nav-hamburger-menu">
				<button
					class="header__nav-hamburger-close"
					aria-label="Close navigation menu"
					@click="closeMenu"
				>
					<Icon
						name="bx:x"
						class="header__nav-hamburger-close-icon"
					/>
				</button>

				<nav class="header__nav-hamburger-links">
					<template v-if="user">
						<NuxtLink
							:to="ROUTES.HOME"
							:class="[
								'header__nav-link',
								route.path === ROUTES.HOME
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							<Icon
								name="bx:globe"
								class="header__nav-link-icon"
							/>
							Feed
						</NuxtLink>

						<NuxtLink
							:to="ROUTES.DISCOVER"
							:class="[
								'header__nav-link',
								route.path === ROUTES.DISCOVER
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							<Icon
								name="bx:search"
								class="header__nav-link-icon"
							/>
							Discover
						</NuxtLink>

						<NuxtLink
							:to="ROUTES.NOTIFICATIONS"
							:class="[
								'header__nav-link',
								route.path === ROUTES.NOTIFICATIONS
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							<Icon
								name="bx:bell"
								class="header__nav-link-icon"
							/>
							Notifications
						</NuxtLink>

						<NuxtLink
							:to="ROUTES.INBOX"
							:class="[
								'header__nav-link mt-6',
								route.path === ROUTES.INBOX
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							<Icon
								name="bx:message-alt"
								class="header__nav-link-icon"
							/>
							Inbox

							<span
								v-if="hasNewInboxItems"
								class="notification-badge"
							>
								{{ newInboxCount }}
							</span>
						</NuxtLink>

						<NuxtLink
							:to="ROUTES.PROFILE"
							:class="[
								'header__nav-link',
								route.path === ROUTES.PROFILE
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							<Icon
								name="bx:id-card"
								class="header__nav-link-icon"
							/>
							Profile
						</NuxtLink>

						<NuxtLink
							:to="ROUTES.MY_QUESTIONS"
							:class="[
								'header__nav-link',
								route.path === ROUTES.MY_QUESTIONS
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							<Icon
								name="bx:question-mark"
								class="header__nav-link-icon"
							/>
							My Questions
						</NuxtLink>

						<NuxtLink
							:to="ROUTES.SETTINGS"
							:class="[
								'header__nav-link',
								route.path === ROUTES.SETTINGS
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							<Icon name="bx:cog" class="header__nav-link-icon" />
							Settings
						</NuxtLink>

						<LogoutButton @click="closeMenu" />
					</template>

					<template v-else>
						<NuxtLink
							:to="ROUTES.LOGIN"
							:class="[
								'header__nav-link',
								route.path === ROUTES.LOGIN
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							Log in
						</NuxtLink>

						<NuxtLink
							:to="ROUTES.SIGNUP"
							:class="[
								'header__nav-link',
								route.path === ROUTES.SIGNUP
									? 'header__nav-link--active'
									: '',
							]"
							@click="closeMenu"
						>
							Sign up
						</NuxtLink>
					</template>
				</nav>
			</div>
		</transition>
	</div>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
