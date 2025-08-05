import { defineStore } from "pinia";

export interface Notification {
	id: string;
	type: string;
	message: string;
	read: boolean;
	createdAt: string;
	payload: unknown;
	eventId: string;
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
			try {
				const user = useSupabaseUser();
				if (!user.value) {
					this.notifications = [];
					this.loading = false;
					return;
				}
				const { fetchNotifications } = await import(
					"@/composables/useNotifications"
				);
				this.notifications = await fetchNotifications(user.value.id);
			} catch (err: any) {
				this.error = err.message || "Failed to fetch notifications";
				this.notifications = [];
			}
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
