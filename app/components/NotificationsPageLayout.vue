<script setup lang="ts">
defineProps<{
	loading?: boolean;
	error?: string;
	title?: string;
}>();

const notificationsStore = useNotificationsStore();

onMounted(() => {
	if (
		!notificationsStore.notifications.length &&
		!notificationsStore.loading
	) {
		notificationsStore.fetchNotifications();
	}
});
</script>

<template>
	<div class="section notifications">
		<div class="notifications__header">
			<h2 class="section__title notifications__title">Notifications</h2>
			<button
				v-if="notificationsStore.notifications.length > 0"
				class="btn btn--secondary btn--small"
				@click="notificationsStore.clearNotifications()"
			>
				Clear all
			</button>
		</div>
		<LoadingError
			:loading="loading || false"
			:error="error || ''"
			loading-text="Loading profile..."
		>
			<slot v-if="!loading && !error" />
		</LoadingError>
	</div>
</template>
