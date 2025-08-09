<script setup lang="ts">
import { signUpWithPassword, validatePassword } from "~/composables/useAuth";
import { validateUsername } from "~/utils/profileUtils";

const router = useRouter();
const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const profileStore = useProfileStore();

const signup = async () => {
	// Validate password
	const passwordValidation = validatePassword(
		password.value,
		confirmPassword.value
	);
	if (!passwordValidation.valid) {
		alert(passwordValidation.error);
		return;
	}

	// Validate username
	const usernameValidation = validateUsername(username.value);
	if (!usernameValidation.valid) {
		alert(usernameValidation.error);
		return;
	}

	// Sign up user
	const result = await signUpWithPassword(email.value, password.value);
	if (!result.success) {
		alert(result.error);
		return;
	}

	const user = result.user;
	if (user) {
		await profileStore.createProfile(user.id, username.value.toLowerCase());
		if (profileStore.error) {
			alert(profileStore.error);
			return;
		}
	}

	alert("Check your email for the confirmation link.");
	router.push(ROUTES.LOGIN);
};

useHead({
	title: "Sign up",
	meta: [
		{ name: "description", content: "Create a new account on Answerly." },
	],
});
</script>

<template>
	<form class="auth-form" @submit.prevent="signup">
		<h2 class="auth-form__title">Welcome! Create your account</h2>

		<label for="email" class="sr-only">Email</label>

		<div class="auth-form__field">
			<Icon name="bx:envelope" class="auth-form__input-icon" />
			<input
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
				v-model="username"
				type="text"
				placeholder="Username"
				class="auth-form__input"
				required
				@input="username = username.toLowerCase()"
			/>
		</div>

		<label for="password" class="sr-only">Password</label>

		<div class="auth-form__field">
			<Icon name="bx:lock-alt" class="auth-form__input-icon" />
			<input
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
