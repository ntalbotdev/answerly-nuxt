<script setup lang="ts">
const notificationsStore = useNotificationsStore();

useHead({
	title: "Notifications",
	meta: [{ name: "description", content: "View your notifications." }],
});

definePageMeta({
	middleware: "auth",
});
</script>

<template>
	<NotificationsPageLayout
		:loading="notificationsStore.loading"
		:error="notificationsStore.error || ''"
		title="Notifications"
	>
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
	</NotificationsPageLayout>
</template>
