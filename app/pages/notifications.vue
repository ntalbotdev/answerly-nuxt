<script setup lang="ts">
const notificationsStore = useNotificationsStore();

onMounted(() => {
	notificationsStore.fetchNotifications();
});

useHead({
	title: "Notifications",
	meta: [{ name: "description", content: "View your notifications." }],
});
</script>

<template>
	<div class="section notifications">
		<h2 class="section__title notifications__title">Notifications</h2>

		<div v-if="notificationsStore.loading" class="loading-text">
			Loading...
		</div>
		<div v-else-if="notificationsStore.error" class="error-text">
			{{ notificationsStore.error }}
		</div>
		<div
			v-else-if="notificationsStore.notifications.length === 0"
			class="muted-text"
		>
			No notifications yet.
		</div>

		<ul v-else class="">
			<li
				v-for="notif in notificationsStore.notifications"
				:key="notif.id"
				class=""
			>
				<span v-if="!notif.read" class="text-blue-500">●</span>
				<div class="">
					<div class="">{{ notif.message }}</div>
					<div class="">
						{{ new Date(notif.createdAt).toLocaleString() }}
					</div>
				</div>
				<button
					v-if="!notif.read"
					class=""
					@click="notificationsStore.markAsRead(notif.id)"
				>
					Mark as read
				</button>
			</li>
		</ul>
	</div>
</template>
