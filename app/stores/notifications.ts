import { defineStore } from "pinia";

export interface Notification {
	id: string;
	user_id: string;
	type: string;
	read: boolean;
	createdAt: string;
	payload?: {
		username?: string;
		follower_id: string;
		following_id?: string;
		question_id?: string;
		from_user_id?: string;
		to_user_id?: string;
		from_username?: string;
		to_username?: string;
	};
	eventId: string;
}
export interface SendNotificationPayload {
	user_id: string;
	type: string;
	payload?: {
		username?: string;
		follower_id: string;
		following_id?: string;
		question_id?: string;
		from_user_id?: string;
		to_user_id?: string;
		from_username?: string;
		to_username?: string;
	};
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
			} catch (err: unknown) {
				if (err instanceof Error) {
					this.error = err.message || "Failed to fetch notifications";
				} else {
					this.error = "Failed to fetch notifications";
				}
				this.notifications = [];
			}
			this.loading = false;
		},
		addNotification(notification: Notification) {
			this.notifications.unshift(notification);
		},
		async markNotificationAsRead(id: string) {
			this.notifications = this.notifications.filter(
				(n) => n.eventId !== id
			);

			const supabase = useSupabaseClient();
			const { error } = await supabase
				.from("notifications")
				.delete()
				.eq("event_id", id);

			if (error) {
				console.error(
					"Error deleting notification from database:",
					error
				);
			}
		},
		clearNotifications() {
			this.notifications = [];
		},
	},
});
