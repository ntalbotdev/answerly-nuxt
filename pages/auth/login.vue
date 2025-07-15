<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
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
		if (user.value) {
			await profileStore.fetchProfileById(user.value.id);
		}
		router.push(ROUTES.HOME);
	}
};
</script>

<template>
	<form class="auth-form" @submit.prevent="login">
		<h2 class="auth-form__title">Log in</h2>
		
		<label for="email" class="sr-only">Email</label>

		<div class="auth-form__field">
			<Icon name="bx:envelope" class="auth-form__input-icon" />
			<input
				id="email"
				v-model="email"
				type="email"
				placeholder="Email"
				class="auth-form__input"
				required
			/>
		</div>

		<label for="password" class="sr-only">Password</label>

		<div class="auth-form__field">
			<Icon name="bx:lock-alt" class="auth-form__input-icon" />
			<input
				id="password"
				v-model="password"
				type="password"
				placeholder="Password"
				class="auth-form__input"
				required
			/>
		</div>

		<NuxtLink :to="ROUTES.FORGOT_PASSWORD" class="auth-form__forgot-password">
			Forgot password?
		</NuxtLink>

		<button type="submit" class="auth-form__button">Log in</button>

		<div class="auth-form__footer">
			Not a member?
			<NuxtLink :to="ROUTES.SIGNUP" class="auth-form__footer-link">
				Sign up
			</NuxtLink>
		</div>
	</form>
</template>
