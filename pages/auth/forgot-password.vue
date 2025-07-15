<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");
const message = ref("");

const sendReset = async () => {
	if (!email.value) {
		message.value = "Please enter your email.";
		return;
	}
	const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
		redirectTo: window.location.origin + "/auth/reset-password",
	});
	if (error) {
		message.value = error.message;
	} else {
		message.value =
			"If your email is registered, a reset link has been sent.";
	}
};
</script>

<template>
	<form
		class="auth-form"
		@submit.prevent="sendReset"
	>
		<h2 class="auth-form__title">
			Forgot your password?
		</h2>
		<label for="email" class="sr-only">Email</label>
		<div class="auth-form__field">
			<Icon name="bx:envelope" class="auth-form__input-icon" />
			<input
				id="email"
				v-model="email"
				type="email"
				placeholder="Enter your email"
				class="auth-form__input"
				required
			/>
		</div>
		<button
			type="submit"
			class="auth-form__button"
		>
			Send reset link
		</button>
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
