import type { Question } from "@/stores/questions";

export async function fetchAskedQuestions(): Promise<
	(Question & { to_username?: string })[]
> {
	const supabase = useSupabaseClient();
	const user = useSupabaseUser();
	if (!user.value) throw new Error("Not logged in");
	const { data, error } = await supabase
		.from("questions")
		.select(
			"id, to_user_id, question, answer, published, created_at, profiles:to_user_id(username)"
		)
		.eq("from_user_id", user.value.id)
		.order("created_at", { ascending: false });
	if (error) throw error;
	return (data || []).map((q: any) => ({
		...q,
		to_username: q.profiles?.username || undefined,
	}));
}

export async function fetchAnsweredQuestionsForUser(userId: string) {
	const supabase = useSupabaseClient();
	const { data, error } = await supabase
		.from("questions")
		.select(
			"id, question, answer, is_anonymous, created_at, answered_at, profiles:from_user_id(avatar_url, display_name, username)"
		)
		.eq("to_user_id", userId)
		.eq("published", true)
		.order("answered_at", { ascending: false });
	if (error) throw error;
	return data || [];
}
