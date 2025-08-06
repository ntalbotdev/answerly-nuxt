import type { Notification } from "@/stores/notifications";

export async function fetchNotifications(
	userId: string
): Promise<Notification[]> {
	const supabase = useSupabaseClient();
	const { data, error } = await supabase
		.from("notifications")
		.select("id, type, is_read, created_at, payload, event_id")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		return [];
	}

	const mappedNotifications = (data || []).map((n: Record<string, unknown>) => ({
		id: n.id as string,
		user_id: n.user_id as string,
		type: n.type as string,
		read: n.is_read as boolean,
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
	}));

	// Debug: Log question notifications specifically
	mappedNotifications.forEach((notif) => {
		if (notif.type === "question") {
			console.log("Question notification fetched:", {
				type: notif.type,
				payload: notif.payload,
				from_username: notif.payload?.from_username
			});
		}
	});

	return mappedNotifications;
}

export function subscribeToNotifications(
	userId: string,
	onChange: (notif: Notification, eventType: string) => void
) {
	const supabase = useSupabaseClient();
	const channel = supabase
		.channel("notifications")
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
					// Type guard for n.type
					const safeType = typeof n.type === "string" ? n.type : "";
					onChange(
						{
							id: n.id,
							user_id: n.user_id,
							type: safeType,
							read: n.is_read,
							createdAt: n.created_at,
							payload: n.payload,
							eventId: n.event_id,
						} as Notification,
						payload.eventType
					);
				}
			}
		)
		.subscribe();
	return channel;
}

export async function sendNotification(notification: SendNotificationPayload) {
	const config = useRuntimeConfig();
	const supabaseUrl = config.public.supabaseUrl;
	const supabaseAnonKey = config.public.supabaseKey;
	const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification`;
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Environment variables are not set in runtime config");
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
}
