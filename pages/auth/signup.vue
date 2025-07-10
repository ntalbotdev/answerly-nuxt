<script setup lang="ts">
import { useProfileStore } from '~/stores/profile';
const supabase = useSupabaseClient();
const router = useRouter();
const email = ref("");
const username = ref("");
const password = ref("");
const profileStore = useProfileStore();

const signup = async () => {
    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
    });
    if (error) {
        alert(error.message);
        return;
    }

    const user = data.user;
    if (user) {
        await profileStore.createProfile(user.id, username.value);
        if (profileStore.error) {
            alert(profileStore.error);
            return;
        }
    }

    alert("Check your email for the confirmation link.");
    router.push("/auth/login");
};
</script>

<template>
    <form class="" @submit.prevent="signup">
        <h1 class="">Sign Up</h1>
        <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class="">
        </input>
        <input
            v-model="username"
            type="text"
            placeholder="Username"
            required
            class="">
        </input>
        <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            class="">
        </input>
        <button type="submit" class="">Sign Up</button>
    </form>
</template>
