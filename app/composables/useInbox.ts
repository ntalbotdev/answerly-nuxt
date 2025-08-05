export function useInboxQuestions() {
	const supabase = useSupabaseClient();
	const user = useSupabaseUser();
	const questionsStore = useQuestionsStore();
	let inboxChannel: ReturnType<typeof supabase.channel> | null = null;

	async function fetchInboxQuestions() {
		if (!user.value?.id) {
			questionsStore.inboxQuestions = [];
			return;
		}
		const { data, error } = await supabase
			.from("questions")
			.select(
				"id, from_user_id, question, is_anonymous, answer, published, created_at, profiles:from_user_id(username)"
			)
			.eq("to_user_id", user.value.id)
			.is("answer", null)
			.order("created_at", { ascending: false });
		if (!error) {
			const questionsWithAskerUsername = (data || []).map((q: Question & { profiles?: { username?: string } }) => ({
				...q,
				asker_username: q.is_anonymous
					? "Anonymous"
					: q.profiles?.username || "Unknown",
			}));
			questionsStore.inboxQuestions.splice(
				0,
				questionsStore.inboxQuestions.length,
				...questionsWithAskerUsername
			);
		}
	}

	function subscribeToInboxQuestions() {
		if (!user.value?.id) return;
		if (inboxChannel) inboxChannel.unsubscribe();
		inboxChannel = supabase
			.channel("inbox-questions")
			.on(
				"system",
				{
					event: "*",
					schema: "public",
					table: "questions",
					filter: `to_user_id=eq.${user.value.id}`,
				},
				(payload: {
					eventType: "INSERT" | "UPDATE" | "DELETE";
					new?: Question;
					old?: Question;
				}) => {
					let arr = [...questionsStore.inboxQuestions];

					switch (payload.eventType) {
						case "INSERT":
							if (
								payload.new &&
								!arr.some((q) => q.id === payload.new!.id)
							) {
								arr.unshift(payload.new);
							}
							break;
						case "UPDATE":
							if (payload.new) {
								const idx = arr.findIndex(
									(q) => q.id === payload.new!.id
								);
								if (idx !== -1) arr[idx] = { ...payload.new };
							}
							break;
						case "DELETE":
							if (payload.old) {
								arr = arr.filter(
									(q) => q.id !== payload.old!.id
								);
							}
							break;
					}

					// Only keep unanswered questions
					const filteredQuestions = arr.filter(
						(q) => q.answer === null
					);
					questionsStore.inboxQuestions.splice(
						0,
						questionsStore.inboxQuestions.length,
						...filteredQuestions
					);
				}
			)
			.subscribe();
	}

	function unsubscribeInboxQuestions() {
		if (inboxChannel) inboxChannel.unsubscribe();
		inboxChannel = null;
	}

	return {
		fetchInboxQuestions,
		subscribeToInboxQuestions,
		unsubscribeInboxQuestions,
	};
}
