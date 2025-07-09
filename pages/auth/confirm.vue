<script setup lang="ts">
const user = useSupabaseUser();

// If not logged in, redirect to /auth/login
if (!user.value) {
  navigateTo("/auth/login");
} else {
  // If logged in, redirect to /
  navigateTo("/");
}

// Also watch for changes (reactivity)
watchEffect(() => {
  if (!user.value) {
    navigateTo("/auth/login");
  } else {
    navigateTo("/");
  }
});
</script>

<template>
    <p>Finalizing authentication...</p>
</template>
