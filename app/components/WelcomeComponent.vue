<template>
	<div class="welcome__wrapper">
		<div class="welcome">
			<h2 class="welcome__title">
				Ask.
				<span class="welcome__title--highlight">Answer.</span> Connect.
			</h2>
			<p class="welcome__description">
				Unleash your curiosity—join the conversation.
			</p>
			<div class="welcome__buttons">
				<NuxtLink
					:to="ROUTES.SIGNUP"
					class="welcome__button auth-form__button"
				>
					Sign up
				</NuxtLink>
				<NuxtLink
					:to="ROUTES.LOGIN"
					class="welcome__button auth-form__button auth-form__button--secondary"
				>
					Log in
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
