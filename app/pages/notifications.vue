<script setup lang="ts">
import type { Notification } from "@/stores/notifications";

const notificationsStore = useNotificationsStore();
const notificationIcon = (type: string) => {
	switch (type) {
		case "follow":
			return "bx:user-plus";
		case "question":
			return "bx:message";
		case "answer":
			return "bx:message-check";
		default:
			return "bx:bell";
	}
};

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
					: notif.payload?.from_username,
				actionLink: ROUTES.INBOX,
				actionText: "Answer Question",
			};
		case "answer":
			return {
				text: "answered your question",
				userLink: notif.payload?.to_username
					? ROUTES.PROFILE_USER(notif.payload.to_username)
					: null,
				username: notif.payload?.to_username,
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
			<div class="notifications__list">
				<li
					v-for="notif in notificationsStore.notifications"
					:key="notif.id"
					class="notifications__item"
				>
					<Icon
						:name="notificationIcon(notif.type)"
						class="notification__icon"
					/>
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
							v-if="getNotificationContent(notif).actionLink"
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
		</LoadingError>
	</div>
</template>
