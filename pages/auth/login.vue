<script setup lang="ts">
import { useProfileStore } from '~/stores/profile';
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const email = ref("");
const password = ref("");
const profileStore = useProfileStore();

const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
    });
    if (error) {
        alert(error.message);
    } else {
        // Fetch profile after login
        if (user.value) {
            await profileStore.fetchProfile(user.value.id);
        }
        router.push("/");
    }
};
</script>

<template>
    <form class="" @submit.prevent="login">
        <h1 class="">Log In</h1>
        <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class=""
        />
        <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            class=""
        />
        <button type="submit" class="">Log In</button>
    </form>
</template>
