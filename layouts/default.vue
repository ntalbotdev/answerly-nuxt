<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const logout = async () => {
  await supabase.auth.signOut();
  navigateTo("/auth/login");
};
</script>

<template>
  <div class="">
    <nav class="">
      <NuxtLink to="/" class="">Answerly</NuxtLink>
      <div>
        <template v-if="user">
          <span class="">{{ user.email }}</span>
          <button class="" @click="logout">Sign Out</button>
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="">Log In</NuxtLink>
          <NuxtLink to="/auth/signup">Sign Up</NuxtLink>
        </template>
      </div>
    </nav>
    <NuxtPage />
  </div>
</template>
