import { defineStore } from "pinia";
import {
	fetchNotifications,
	subscribeToNotifications,
} from "@/composables/useNotifications";

export interface Notification {
	id: string;
	user_id: string;
	type: string;
	createdAt: string;
	payload?: {
		username?: string;
		follower_id?: string;
		following_id?: string;
		question_id?: string;
		from_user_id?: string;
		to_user_id?: string;
		from_username?: string;
		to_username?: string;
		is_anonymous?: boolean;
	};
	eventId: string;
}
export interface SendNotificationPayload {
	user_id: string;
	type: string;
	payload?: {
		username?: string;
		follower_id?: string;
		following_id?: string;
		question_id?: string;
		from_user_id?: string;
		to_user_id?: string;
		from_username?: string;
		to_username?: string;
		is_anonymous?: boolean;
	};
}

let realtimeSubscription: ReturnType<typeof subscribeToNotifications> | null =
	null;

export const useNotificationsStore = defineStore("notifications", {
	state: () => ({
		notifications: [] as Notification[],
		loading: false,
		error: null as string | null,
	}),
	getters: {
		unreadCount(state): number {
			return state.notifications.length;
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
			try {
			 await supabase
			 .from("notifications")
			 .delete()
			 .eq("event_id", id);
			} catch {
			 // handle error if needed
			}
		},
		async clearNotifications() {
			const user = useSupabaseUser();
			if (!user.value) return;

			this.notifications = [];

			const supabase = useSupabaseClient();
			try {
			 await supabase
			 .from("notifications")
			 .delete()
			 .eq("user_id", user.value.id);
			} catch {
			 // handle error if needed
			}
		},

		async startRealtimeSubscription() {
			const user = useSupabaseUser();

			if (!user.value) return;

			if (realtimeSubscription) {
				realtimeSubscription.unsubscribe();
				realtimeSubscription = null;
			}

			realtimeSubscription = subscribeToNotifications(
				user.value.id,
				(notification, eventType) => {
					if (eventType === "INSERT") {
						const currentNotifications = [...this.notifications];
						if (
							!currentNotifications.some(
								(n) => n.id === notification.id
							)
						) {
							currentNotifications.unshift(notification);
							this.notifications = currentNotifications;
						}
					} else if (eventType === "DELETE") {
						this.notifications = this.notifications.filter(
						 (n) => n.eventId !== notification.eventId
						);
					}
				}
			);
		},

		stopRealtimeSubscription() {
			if (realtimeSubscription) {
				realtimeSubscription.unsubscribe();
				realtimeSubscription = null;
			}
		},
	},
});
