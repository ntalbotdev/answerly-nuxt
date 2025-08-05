import type { Notification } from "@/stores/notifications";

export async function fetchNotifications(
	userId: string
): Promise<Notification[]> {
	const supabase = useSupabaseClient();
	const { data, error } = await supabase
		.from("notifications")
		.select("id, type, message, is_read, created_at, payload, event_id")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		return [];
	}

	return (data || []).map((n: Record<string, unknown>) => ({
		id: n.id as string,
		type: n.type as string,
		message: n.message as string,
		read: n.is_read as boolean,
		createdAt: n.created_at as string,
		payload: n.payload,
		eventId: n.event_id as string,
	}));
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
					onChange(
						{
							id: n.id,
							type: n.type,
							message: n.message,
							read: n.is_read,
							createdAt: n.created_at,
							payload: n.payload,
							eventId: n.event_id,
						},
						payload.eventType
					);
				}
			}
		)
		.subscribe();
	return channel;
}
