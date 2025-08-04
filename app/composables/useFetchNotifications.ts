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
		return [];
	}

	return (data || []).map((n: Record<string, unknown>) => ({
		id: n.id as string,
		type: n.type as string,
		message: n.message as string,
		read: n.is_read as boolean,
		createdAt: n.created_at as string,
		payload: n.payload,
	}));
}
