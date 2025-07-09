<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const profileStore = useProfileStore();

watchEffect(async () => {
    if (user.value) {
        await profileStore.fetchProfile(supabase, user.value.id);
    } else {
        profileStore.clearProfile();
    }
});

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
                    <span class="">{{ profileStore.profile?.username }}</span>
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
