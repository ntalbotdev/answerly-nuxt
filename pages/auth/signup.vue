<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();
const user = useSupabaseUser();
const email = ref("");
const password = ref("");

const signup = async () => {
    const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
    });
    if (error) {
        alert(error.message);
    } else {
        alert("Check your email for the confirmation link.");
        router.push("/auth/login");
    }
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
            class=""
        />
        <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            class=""
        />
        <button type="submit" class="">Sign Up</button>
    </form>
</template>
