<script setup lang="ts">
const year = new Date().getFullYear();
const githubUrl = "https://github.com/ntalbotdev/answerly-nuxt";
</script>

<template>
	<footer class="footer">
		<p class="footer__copyright">&copy; {{ year }} Answerly</p>
		<div class="footer__note">
			Project made to showcase my skills.
			<a
				class="footer__link"
				:href="githubUrl"
				target="_blank"
				rel="noopener noreferrer"
			>
				View on GitHub
			</a>
		</div>
	</footer>
</template>
