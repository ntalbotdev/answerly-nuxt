<script setup lang="ts">
const showMenu = ref(false);
const user = useSupabaseUser();
const route = useRoute();
function toggleMenu() {
  showMenu.value = !showMenu.value;
}
function closeMenu() {
  showMenu.value = false;
}
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
        <button class="header__nav-hamburger-close" aria-label="Close navigation menu" @click="closeMenu">
          <Icon name="bx:x" class="text-2xl" />
        </button>

        <nav class="header__nav-hamburger-links">
          <template v-if="user">
            <NuxtLink
              to="/"
              :class="['header__nav-link', route.path === '/' ? 'header__nav-link--active' : '']"
              @click="closeMenu"
            >
              <Icon name="bx:globe" class="header__nav-link-icon" /> Feed
            </NuxtLink>

            <NuxtLink
              to="/discover"
              :class="['header__nav-link', route.path === '/discover' ? 'header__nav-link--active' : '']"
              @click="closeMenu"
            >
              <Icon name="bx:search" class="header__nav-link-icon" /> Discover
            </NuxtLink>

            <NuxtLink
              to="/notifications"
              :class="['header__nav-link', route.path === '/notifications' ? 'header__nav-link--active' : '']"
              @click="closeMenu"
            >
              <Icon name="bx:bell" class="header__nav-link-icon" /> Notifications
            </NuxtLink>

            <HeaderUserDropdown mobile @close="closeMenu" />
          </template>

          <template v-else>
            <NuxtLink
              to="/auth/login"
              :class="['header__nav-link', route.path === '/auth/login' ? 'header__nav-link--active' : '']"
              @click="closeMenu"
            >
              Log in
            </NuxtLink>

            <NuxtLink
              to="/auth/signup"
              :class="['header__nav-link', route.path === '/auth/signup' ? 'header__nav-link--active' : '']"
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
