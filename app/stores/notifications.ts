import { defineStore } from "pinia";

export interface Notification {
	id: string;
	type: string;
	message: string;
	read: boolean;
	createdAt: string;
	payload: unknown;
}

export const useNotificationsStore = defineStore("notifications", {
	state: () => ({
		notifications: [] as Notification[],
		loading: false,
		error: null as string | null,
	}),
	actions: {
		async fetchNotifications() {
			this.loading = true;
			this.error = null;
			// TODO: Fetch notifications from API or Supabase
			// Example: this.notifications = await fetchNotificationsApi();
			this.loading = false;
		},
		addNotification(notification: Notification) {
			this.notifications.unshift(notification);
		},
		markAsRead(id: string) {
			const notif = this.notifications.find((n) => n.id === id);
			if (notif) notif.read = true;
		},
		clearNotifications() {
			this.notifications = [];
		},
	},
});
