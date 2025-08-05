<template>
	<div>
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const questionsStore = useQuestionsStore();
const notificationsStore = useNotificationsStore();
let notificationChannel: any = null;

onMounted(() => {
	if (user.value) {
		questionsStore.fetchIncomingQuestions();
	}
});

// Watch for user login/logout and refetch inbox questions
watch(user, (newUser) => {
	if (newUser) {
		questionsStore.fetchIncomingQuestions();
	} else {
		questionsStore.inboxQuestions = [];
	}
});

// Subscribe to notifications if user is logged in
watch(
	() => user.value?.id,
	(id) => {
		if (id) {
			notificationsStore.fetchNotifications();
			if (notificationChannel) notificationChannel.unsubscribe();
			notificationChannel = subscribeToNotifications(
				id,
				(notif, eventType) => {
					if (eventType === "INSERT") {
						notificationsStore.addNotification(notif);
					}
					if (eventType === "UPDATE") {
						const idx = notificationsStore.notifications.findIndex(
							(n) =>
								n.id === notif.id || n.eventId === notif.eventId
						);
						if (idx !== -1) {
							notificationsStore.notifications[idx] = notif;
						} else {
							notificationsStore.addNotification(notif);
						}
					}
				}
			);
		} else if (notificationChannel) {
			notificationChannel.unsubscribe();
			notificationChannel = null;
		}
	},
	{ immediate: true }
);

onUnmounted(() => {
	if (notificationChannel) notificationChannel.unsubscribe();
});

useHead({
	titleTemplate: "%s - Answerly",
	meta: [
		{
			name: "description",
			content: "A platform for asking and answering questions.",
		},
	],
});
</script>
