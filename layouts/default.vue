<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const profileStore = useProfileStore();
const router = useRouter();

// Fetch profile on login, clear on logout
watchEffect(async () => {
    if (user.value) {
        if (
            !profileStore.myProfile ||
            profileStore.myProfile.user_id !== user.value.id
        ) {
            await profileStore.fetchProfileById(user.value.id);
        }
    } else {
        profileStore.clearProfile();
    }
});

const logout = async () => {
    await supabase.auth.signOut();
    profileStore.clearProfile();
    router.push("/auth/login");
};
</script>

<template>
    <div>
        <nav>
            <NuxtLink to="/">Answerly</NuxtLink>
            <div>
                <template v-if="user">
                    <span v-if="profileStore.loading">Loading...</span>
                    <span v-else-if="profileStore.error" style="color: red">
                        {{ profileStore.error }}
                    </span>
                    <span v-else>{{ profileStore.myProfile?.username }}</span>
                    <NuxtLink to="/my/profile">My profile</NuxtLink>
                    <NuxtLink to="/my/inbox">Inbox</NuxtLink>
                    <NuxtLink to="/my/asked">Asked</NuxtLink>
                    <NuxtLink to="/profile/spell">spell's profile</NuxtLink>
                    <button @click="logout">Sign Out</button>
                </template>
                <template v-else>
                    <NuxtLink to="/auth/login">Log In</NuxtLink>
                    <NuxtLink to="/auth/signup">Sign Up</NuxtLink>
                </template>
            </div>
        </nav>
        <NuxtPage />
    </div>
</template>

<style scoped>
a {
    display: table;
}
</style>
