<script setup lang="ts">
import { useProfileStore } from '~/stores/profile';
const supabase = useSupabaseClient();
const router = useRouter();
const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const profileStore = useProfileStore();

const signup = async () => {
    if (password.value !== confirmPassword.value) {
        alert("Passwords do not match.");
        return;
    }
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
    <form
        class="auth-form mx-auto mt-16 flex max-w-xs flex-col gap-4 p-4"
        @submit.prevent="signup"
    >
        <h2 class="auth-form__title mb-2 text-center text-3xl font-semibold">
            Welcome! Create your account
        </h2>
        <label for="email" class="sr-only">Email</label>
        <div class="auth-form__field flex items-center px-3 py-1">
            <Icon name="bx:envelope" class="auth-form__input-icon" />
            <input
                v-model="email"
                type="email"
                placeholder="Email"
                required
                class="auth-form__input block w-full px-3 py-2"
            />
        </div>
        <label for="username" class="sr-only">Username</label>
        <div class="auth-form__field flex items-center px-3 py-1">
            <Icon name="bx:user" class="auth-form__input-icon" />
            <input
                v-model="username"
                type="text"
                placeholder="Username"
                required
                class="auth-form__input block w-full px-3 py-2"
            />
        </div>
        <label for="password" class="sr-only">Password</label>
        <div class="auth-form__field flex items-center px-3 py-1">
            <Icon name="bx:lock-alt" class="auth-form__input-icon" />
            <input
                v-model="password"
                type="password"
                placeholder="Password"
                required
                class="auth-form__input block w-full px-3 py-2"
            />
        </div>
        <label for="confirmPassword" class="sr-only">Confirm Password</label>
        <div class="auth-form__field flex items-center px-3 py-1">
            <Icon name="bx:lock-alt" class="auth-form__input-icon" />
            <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
                class="auth-form__input block w-full px-3 py-2"
            />
        </div>
        <button
            type="submit"
            class="auth-form__button mt-2 block w-full px-3 py-2 font-bold"
        >
            Sign up
        </button>
        <div class="auth-form__signup mt-2 p-2 text-center text-sm">
            Already a member?
            <NuxtLink to="/auth/login" class="ml-1 font-medium underline">
                Log in
            </NuxtLink>
        </div>
    </form>
</template>
