<script setup lang="ts">
import type { Notification } from "@/stores/notifications";

const props = defineProps<{
	notifications: Notification[];
	markAsRead: (eventId: string) => void;
	formatDateNoSeconds: (date: string) => string;
}>();

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
					: (notif.payload?.from_username ?? null),
				actionLink: ROUTES.INBOX,
				actionText: "Answer Question",
			};
		case "answer":
			return {
				text: "answered your question",
				userLink: notif.payload?.to_username
					? ROUTES.PROFILE_USER(notif.payload.to_username)
					: null,
				username: notif.payload?.to_username ?? null,
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
</script>

<template>
	<ul class="notifications__list">
		<NotificationItem
			v-for="notif in notifications"
			:key="notif.id"
			:notif="notif"
			:get-notification-content="getNotificationContent"
			:notification-icon="notificationIcon"
			:mark-as-read="markAsRead"
			:format-date-no-seconds="formatDateNoSeconds"
		/>
	</ul>
</template>
