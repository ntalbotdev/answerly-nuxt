<script setup lang="ts">
const session = useSupabaseSession();

// watch for session and redirect when present
if (!session.value) {
    navigateTo(ROUTES.LOGIN);
} else {
    navigateTo(ROUTES.HOME);
}

useHead({
  title: 'Finalizing Authentication',
})
</script>

<template>
    <p>Finalizing authentication...</p>
</template>
