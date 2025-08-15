<script setup lang="ts">
import { GITHUB_URL } from "@/utils/constants";
const year = new Date().getFullYear();
</script>

<template>
	<footer class="footer">
		<p class="footer__copyright">&copy; {{ year }} Answerly</p>
		<div class="footer__note">
			Project made to showcase my skills.
			<a
				class="footer__link"
				:href="GITHUB_URL"
				target="_blank"
				rel="noopener noreferrer"
			>
				View on GitHub
			</a>
		</div>
	</footer>
</template>
