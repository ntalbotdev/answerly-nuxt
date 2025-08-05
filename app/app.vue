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
let notificationChannel: ReturnType<typeof subscribeToNotifications> | null =
	null;

const {
	fetchInboxQuestions,
	subscribeToInboxQuestions,
	unsubscribeInboxQuestions,
} = useInboxQuestions();

onMounted(() => {
	if (user.value) {
		fetchInboxQuestions();
		subscribeToInboxQuestions();
	}
});

watch(user, (newUser) => {
	if (newUser) {
		fetchInboxQuestions();
		subscribeToInboxQuestions();
	} else {
		if (
			!questionsStore.inboxQuestions.length ||
			questionsStore.inboxQuestions.length === 0
		) {
			questionsStore.inboxQuestions = [];
		}
		unsubscribeInboxQuestions();
		if (
			!notificationsStore.notifications.length ||
			notificationsStore.notifications.length === 0
		) {
			notificationsStore.notifications = [];
		}
	}
});

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
	unsubscribeInboxQuestions();
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
