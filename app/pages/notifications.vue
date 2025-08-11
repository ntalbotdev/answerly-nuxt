<script setup lang="ts">
const notificationsStore = useNotificationsStore();

onMounted(() => {
	if (
		!notificationsStore.notifications.length &&
		!notificationsStore.loading
	) {
		notificationsStore.fetchNotifications();
	}
});

useHead({
	title: "Notifications",
	meta: [{ name: "description", content: "View your notifications." }],
});

definePageMeta({
	middleware: "auth",
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
			:loading="
				notificationsStore.loading &&
				!notificationsStore.notifications.length
			"
			:error="notificationsStore.error || ''"
			:show-empty-state="notificationsStore.notifications.length === 0"
			empty-state="No notifications yet."
			loading-text="Loading notifications..."
		>
			<NotificationList
				:notifications="notificationsStore.notifications"
				:mark-as-read="notificationsStore.markNotificationAsRead"
				:format-date-no-seconds="formatDateNoSeconds"
			/>
		</LoadingError>
	</div>
</template>
