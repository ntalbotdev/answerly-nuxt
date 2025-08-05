import { defineStore } from "pinia";

export interface Notification {
	id: string;
	user_id: string;
	type: string;
	message: string;
	read: boolean;
	createdAt: string;
	payload?: {
		username?: string;
		follower_id: string;
	};
	eventId: string;
}
export interface SendNotificationPayload {
	user_id: string;
	type: string;
	message: string;
	payload?: {
		username?: string;
		follower_id: string;
	};
	event_id: string;
}

export const useNotificationsStore = defineStore("notifications", {
	state: () => ({
		notifications: [] as Notification[],
		loading: false,
		error: null as string | null,
	}),
	getters: {
		unreadCount(state): number {
			return state.notifications.filter((n) => !n.read).length;
		},
	},
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
		async markNotificationAsRead(id: string) {
			console.log(
				"Attempting to remove notification with id/eventId:",
				id
			);

			// First, let's see what notifications we have
			const matchingNotifications = this.notifications.filter(
				(n) => n.id === id || n.eventId === id
			);
			console.log("Found matching notifications:", matchingNotifications);

			this.notifications = this.notifications.filter(
				(n) => n.id !== id && n.eventId !== id
			);

			const supabase = useSupabaseClient();
			const { error } = await supabase
				.from("notifications")
				.delete()
				.or(`id.eq.${id},event_id.eq.${id}`);

			if (error) {
				console.error(
					"Error deleting notification from database:",
					error
				);
			} else {
				console.log("Successfully deleted notification from database");
			}
		},
		clearNotifications() {
			this.notifications = [];
		},
	},
});
