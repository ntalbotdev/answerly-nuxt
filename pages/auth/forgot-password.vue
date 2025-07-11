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
		class="auth-form mx-auto mt-16 flex max-w-xs flex-col gap-4 p-4"
		@submit.prevent="sendReset"
	>
		<h2 class="auth-form__title mb-2 text-center text-3xl font-semibold">
			Forgot your password?
		</h2>
		<label for="email" class="sr-only">Email</label>
		<div class="auth-form__field flex items-center px-3 py-1">
			<Icon name="bx:envelope" class="auth-form__input-icon" />
			<input
				v-model="email"
				type="email"
				placeholder="Enter your email"
				required
				class="auth-form__input block w-full px-3 py-2"
			/>
		</div>
		<button
			type="submit"
			class="auth-form__button mt-2 block w-full px-3 py-2 font-bold"
		>
			Send reset link
		</button>
		<div v-if="message" class="auth-form__message mt-2 text-center text-sm">
			{{ message }}
		</div>
		<div class="auth-form__signup mt-2 p-2 text-center text-sm">
			Remembered?
			<NuxtLink to="/auth/login" class="ml-1 font-medium underline">
				Log in
			</NuxtLink>
		</div>
	</form>
</template>
