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
		async sendNotification(notification: SendNotificationPayload) {
			const config = useRuntimeConfig();
			const supabaseUrl = config.public.supabaseUrl;
			const supabaseAnonKey = config.public.supabaseKey;
			const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification`;
			if (!supabaseUrl) {
				throw new Error("Supabase URL is not set in runtime config");
			}

			const res = await fetch(edgeFunctionUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${supabaseAnonKey}`,
				},
				body: JSON.stringify(notification),
			});

			if (!res.ok) {
				const error = await res.text();
				throw new Error(error);
			}
			return await res.text();
		},
		addNotification(notification: Notification) {
			this.notifications.unshift(notification);
		},
		async markAsRead(id: string) {
			// Remove from local state
			this.notifications = this.notifications.filter(
				(n) => n.id !== id && n.eventId !== id
			);
			// Remove from database
			const supabase = useSupabaseClient();
			await supabase
				.from("notifications")
				.delete()
				.or(`id.eq.${id},event_id.eq.${id}`);
		},
		clearNotifications() {
			this.notifications = [];
		},
	},
});
