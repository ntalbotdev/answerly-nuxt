<script setup lang="ts">
const notificationsStore = useNotificationsStore();

onMounted(() => {
	notificationsStore.fetchNotifications();
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
		<h2 class="section__title notifications__title">Notifications</h2>

		<div v-if="notificationsStore.loading" class="loading-text">
			Loading...
		</div>

		<div v-else-if="notificationsStore.error" class="error-text">
			{{ notificationsStore.error }}
		</div>

		<div v-else class="notifications__list">
			<div
				v-if="notificationsStore.notifications.length === 0"
				class="muted-text"
			>
				No notifications yet.
			</div>

			<li
				v-for="notif in notificationsStore.notifications"
				:key="notif.id"
				class="notifications__item"
			>
				<span v-if="!notif.read" class="">●</span>
				<div>
					<template
						v-if="
							notif.type === 'follow' &&
							notif.payload &&
							notif.payload.username
						"
					>
						<router-link :to="`/profile/${notif.payload.username}`"
							>@{{ notif.payload.username }}</router-link
						>
						{{ notif.message }}
					</template>
					<template v-else>
						{{ notif.message }}
					</template>
					<div>
						{{ new Date(notif.createdAt).toLocaleString() }}
					</div>
				</div>
				<button
					v-if="!notif.read"
					@click="
						notificationsStore.markNotificationAsRead(notif.eventId)
					"
				>
					Mark as read
				</button>
			</li>
		</div>
	</div>
</template>
