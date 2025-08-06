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

const {
	fetchInboxQuestions,
	subscribeToInboxQuestions,
	unsubscribeInboxQuestions,
} = useInboxQuestions();

watch(
	user,
	(newUser, oldUser) => {
		if (newUser && !oldUser) {
			fetchInboxQuestions();
			subscribeToInboxQuestions();
			notificationsStore.fetchNotifications();
			notificationsStore.startRealtimeSubscription();
		} else if (!newUser && oldUser) {
			questionsStore.inboxQuestions = [];
			unsubscribeInboxQuestions();
			notificationsStore.notifications = [];
			notificationsStore.stopRealtimeSubscription();
		}
	},
	{ immediate: true }
);

onUnmounted(() => {
	notificationsStore.stopRealtimeSubscription();
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
