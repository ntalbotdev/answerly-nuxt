<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
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
	router.push(ROUTES.LOGIN);
};
</script>

<template>
	<form class="auth-form" @submit.prevent="signup">
		<h2 class="auth-form__title">Welcome! Create your account</h2>

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

		<label for="username" class="sr-only">Username</label>

		<div class="auth-form__field">
			<Icon name="bx:user" class="auth-form__input-icon" />
			<input
				id="username"
				v-model="username"
				type="text"
				placeholder="Username"
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

		<label for="confirm-password" class="sr-only">Confirm Password</label>

		<div class="auth-form__field">
			<Icon name="bx:lock-alt" class="auth-form__input-icon" />
			<input
				id="confirm-password"
				v-model="confirmPassword"
				type="password"
				placeholder="Confirm Password"
				class="auth-form__input"
				required
			/>
		</div>

		<button type="submit" class="auth-form__button">Sign up</button>

		<div class="auth-form__footer">
			Already a member?
			<NuxtLink :to="ROUTES.LOGIN" class="auth-form__footer-link">
				Log in
			</NuxtLink>
		</div>
	</form>
</template>
