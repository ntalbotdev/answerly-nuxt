<script setup lang="ts">
const session = useSupabaseSession();

// watch for session and redirect when present
if (!session.value) {
    navigateTo("/auth/login");
} else {
    navigateTo("/");
}
</script>

<template>
    <p>Finalizing authentication...</p>
</template>
