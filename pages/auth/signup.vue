<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();
const email = ref("");
const username = ref("");
const password = ref("");

const signup = async () => {
    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
    });
    if (error) {
        alert(error.message);
        return;
    }

    // Create profile if sign up was successful and user exists
    const user = data.user;
    if (user) {
        // Create profile in the "profiles" table
        // Note: The "profiles" table should have a "user_id" column that matches
        const { error: profileError } = await supabase.from("profiles").insert([
            {
                user_id: user.id,
                username: username.value,
            },
        ]);
        if (profileError) {
            alert(profileError.message);
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
