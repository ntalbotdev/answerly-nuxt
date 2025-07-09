<script setup lang="ts">
const user = useSupabaseUser();

onBeforeMount(() => {
  if (!user.value) {
	// redirect to /auth/login if user is not logged in
    navigateTo("/auth/login");
  }
});
</script>