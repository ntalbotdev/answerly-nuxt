import type { Notification } from "@/stores/notifications";

export async function fetchNotifications(
	userId: string
): Promise<Notification[]> {
	const supabase = useSupabaseClient();

	const { data, error } = await supabase
		.from("notifications")
		.select("id, user_id, type, created_at, payload, event_id")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		return [];
	}

	const mappedNotifications = (data || []).map(
		(n: Record<string, unknown>) => ({
			id: n.id as string,
			user_id: n.user_id as string,
			type: n.type as string,
			createdAt: n.created_at as string,
			payload: n.payload as
				| {
						username?: string;
						follower_id?: string;
						following_id?: string;
						question_id?: string;
						from_user_id?: string;
						to_user_id?: string;
						from_username?: string;
						to_username?: string;
				  }
				| undefined,
			eventId: n.event_id as string,
		})
	);

	return mappedNotifications;
}

export function subscribeToNotifications(
	userId: string,
	onChange: (notif: Notification, eventType: string) => void
) {
	const supabase = useSupabaseClient();

	const channelName = `notifications-${userId}`;
	const channel = supabase
		.channel(channelName)
		.on(
			"postgres_changes",
			{
				event: "*",
				schema: "public",
				table: "notifications",
				filter: `user_id=eq.${userId}`,
			},
			(payload) => {
				if (
					payload.eventType === "INSERT" ||
					payload.eventType === "UPDATE"
				) {
					const n = payload.new;
					const safeType = typeof n.type === "string" ? n.type : "";
					const notification = {
						id: n.id,
						user_id: n.user_id,
						type: safeType,
						createdAt: n.created_at,
						payload: n.payload,
						eventId: n.event_id,
					} as Notification;
					onChange(notification, payload.eventType);
				} else if (payload.eventType === "DELETE") {
					const n = payload.old;
					const notification = {
						id: n.id,
						user_id: n.user_id,
						type: n.type,
						createdAt: n.created_at,
						payload: n.payload,
						eventId: n.event_id,
					} as Notification;
					onChange(notification, payload.eventType);
				}
			}
		)
		.subscribe((status) => {
			if (import.meta.dev) {
				console.log(`Notifications subscription status: ${status}`);
			}
		});

	return channel;
}

export async function sendNotification(notification: SendNotificationPayload) {
	const res = await callSupabaseEdgeFunction(
		"send-notification",
		"POST",
		notification
	);
	return await res.text();
}
