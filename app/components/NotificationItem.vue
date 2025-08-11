<script setup lang="ts">
import type { Notification } from "@/stores/notifications";

const props = defineProps<{
	notif: Notification;
	getNotificationContent: (notif: Notification) => {
		text: string;
		userLink: string | null;
		username: string | null;
		actionLink: string | null;
		actionText: string | null;
	};
	notificationIcon: (type: string) => string;
	markAsRead: (eventId: string) => void;
	formatDateNoSeconds: (date: string) => string;
}>();
</script>

<template>
	<li class="notifications__item">
		<Icon :name="notificationIcon(notif.type)" class="notification__icon" />
		<div class="notification__content">
			<div
				v-if="getNotificationContent(notif).username"
				class="notification__text"
			>
				<NuxtLink
					v-if="getNotificationContent(notif).userLink"
					:to="getNotificationContent(notif).userLink!"
					class="notification__username"
				>
					@{{ getNotificationContent(notif).username }}
				</NuxtLink>
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
			<NuxtLink
				v-if="getNotificationContent(notif).actionLink"
				:to="getNotificationContent(notif).actionLink!"
				class="btn btn--primary btn--small"
				@click="markAsRead(notif.eventId)"
			>
				{{ getNotificationContent(notif).actionText }}
			</NuxtLink>
			<button
				class="btn btn--secondary btn--small"
				@click="markAsRead(notif.eventId)"
			>
				Mark as read
			</button>
		</div>
	</li>
</template>
