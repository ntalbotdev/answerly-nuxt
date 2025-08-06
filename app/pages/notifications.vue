<script setup lang="ts">
import type { Notification } from "@/stores/notifications";

const notificationsStore = useNotificationsStore();

onMounted(() => {
	if (
		!notificationsStore.notifications.length &&
		!notificationsStore.loading
	) {
		notificationsStore.fetchNotifications();
	}
});

function getNotificationContent(notif: Notification) {
	switch (notif.type) {
		case "follow":
			return {
				text: "followed you",
				userLink: notif.payload?.username
					? ROUTES.PROFILE_USER(notif.payload.username)
					: null,
				username: notif.payload?.username || "Someone",
				actionLink: null,
				actionText: null,
			};
		case "question":
			return {
				text: "asked you a question",
				userLink:
					notif.payload?.is_anonymous || !notif.payload?.from_username
						? null
						: ROUTES.PROFILE_USER(notif.payload.from_username),
				username: notif.payload?.is_anonymous
					? "Anonymous"
					: notif.payload?.from_username || "Someone",
				actionLink: ROUTES.INBOX,
				actionText: "Answer Question",
			};
		case "answer":
			return {
				text: "answered your question",
				userLink: notif.payload?.to_username
					? ROUTES.PROFILE_USER(notif.payload.to_username)
					: null,
				username: notif.payload?.to_username || "Someone",
				actionLink: notif.payload?.to_username
					? ROUTES.PROFILE_USER(notif.payload.to_username)
					: null,
				actionText: "View Answer",
			};
		default:
			return {
				text: "You have a new notification",
				userLink: null,
				username: null,
				actionLink: null,
				actionText: "View",
			};
	}
}

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
				Clear All
			</button>
		</div>

		<div
			v-if="
				notificationsStore.loading &&
				!notificationsStore.notifications.length
			"
			class="loading-text"
		>
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
				<div v-if="!notif.read" class="notification-dot" />
				<div class="notification__content">
					<div
						v-if="getNotificationContent(notif).username"
						class="notification__text"
					>
						<router-link
							v-if="getNotificationContent(notif).userLink"
							:to="getNotificationContent(notif).userLink!"
							class="notification__username"
						>
							@{{ getNotificationContent(notif).username }}
						</router-link>
						<span v-else class="notification__username">
							{{ getNotificationContent(notif).username }}
						</span>
						{{ getNotificationContent(notif).text }}
					</div>

					<div v-else class="notification__text">
						{{ getNotificationContent(notif).text }}
					</div>

					<span class="notification__date">
						{{ formatDateNoSeconds(notif.createdAt) }}
					</span>
				</div>

				<div class="notification__buttons">
					<router-link
						v-if="
							!notif.read &&
							getNotificationContent(notif).actionLink
						"
						:to="getNotificationContent(notif).actionLink!"
						class="btn btn--primary btn--small"
						@click="
							notificationsStore.markNotificationAsRead(
								notif.eventId
							)
						"
					>
						{{ getNotificationContent(notif).actionText }}
					</router-link>

					<button
						v-if="!notif.read"
						class="btn btn--secondary btn--small"
						@click="
							notificationsStore.markNotificationAsRead(
								notif.eventId
							)
						"
					>
						Mark as read
					</button>
				</div>
			</li>
		</div>
	</div>
</template>
