<script setup lang="ts">
import { sendPasswordReset, validateEmail } from "~/composables/useAuth";

const email = ref("");
const message = ref("");

const sendReset = async () => {
	const emailValidation = validateEmail(email.value);
	if (!emailValidation.valid) {
		message.value = emailValidation.error || "Please enter a valid email.";
		return;
	}

	const result = await sendPasswordReset(
		email.value,
		window.location.origin + ROUTES.FORGOT_PASSWORD
	);

	if (!result.success) {
		message.value = result.error || "An error occurred.";
	} else {
		message.value =
			"If your email is registered, a reset link has been sent.";
	}
};

useHead({
	title: "Forgot Password",
	meta: [
		{ name: "description", content: "Reset your password for Answerly." },
	],
});
</script>

<template>
	<form class="auth-form" @submit.prevent="sendReset">
		<h2 class="auth-form__title">Forgot your password?</h2>
		<label for="email" class="sr-only">Email</label>
		<div class="auth-form__field">
			<Icon name="bx:envelope" class="auth-form__input-icon" />
			<input
				v-model="email"
				type="email"
				placeholder="Enter your email"
				class="auth-form__input"
				required
			/>
		</div>
		<button type="submit" class="auth-form__button">Send reset link</button>
		<div v-if="message" class="auth-form__message">
			{{ message }}
		</div>
		<div class="auth-form__footer">
			Remembered?
			<NuxtLink :to="ROUTES.LOGIN" class="auth-form__footer-link">
				Log in
			</NuxtLink>
		</div>
	</form>
</template>
