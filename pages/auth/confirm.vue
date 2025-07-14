<script setup lang="ts">
import { ROUTES } from "~/utils/routes";

const session = useSupabaseSession();

// watch for session and redirect when present
if (!session.value) {
    navigateTo(ROUTES.LOGIN);
} else {
    navigateTo(ROUTES.HOME);
}
</script>

<template>
    <p>Finalizing authentication...</p>
</template>
