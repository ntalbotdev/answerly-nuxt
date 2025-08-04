import type { Notification } from "@/stores/notifications";

export async function useFetchNotifications(
	userId: string
): Promise<Notification[]> {
	const supabase = useSupabaseClient();
	const { data, error } = await supabase
		.from("notifications")
		.select("id, type, message, is_read, created_at, payload")
		.eq("target_user", userId)
		.order("created_at", { ascending: false });

	if (error) {
		// Optionally handle error
		return [];
	}

	// Map DB fields to Notification interface
	return (data || []).map((n: any) => ({
		id: n.id,
		type: n.type,
		message: n.message,
		read: n.is_read,
		createdAt: n.created_at,
		payload: n.payload,
	}));
}
