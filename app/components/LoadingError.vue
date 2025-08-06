<script setup lang="ts">
interface Props {
	loading: boolean;
	error: string;
	loadingText?: string;
	emptyState?: string;
	showEmptyState?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	loadingText: "Loading...",
	emptyState: "No data available.",
	showEmptyState: false,
});
</script>

<template>
	<div v-if="loading" class="loading-error-container">
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p class="loading-text">{{ loadingText }}</p>
		</div>
	</div>

	<div v-else-if="error" class="loading-error-container">
		<div class="error-state">
			<div class="error-icon">⚠️</div>
			<p class="error-text">{{ error }}</p>
		</div>
	</div>

	<div v-else-if="showEmptyState" class="loading-error-container">
		<div class="empty-state">
			<div class="empty-icon">📭</div>
			<p class="muted-text">{{ emptyState }}</p>
		</div>
	</div>

	<slot v-else />
</template>
