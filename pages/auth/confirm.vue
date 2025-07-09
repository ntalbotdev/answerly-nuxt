<script setup lang="ts">
const session = useSupabaseSession();
// watch for session and redirect when present
watch(session, (s) => {
  if (s) navigateTo("/");
});
</script>

<template>
    <p>Finalizing authentication…</p>
</template>
