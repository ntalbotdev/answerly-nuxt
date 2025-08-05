export function useInboxQuestions() {
	interface Question {
		id: string;
		to_user_id: string;
		from_user_id: string;
		question: string;
		is_anonymous: boolean;
		answer: string | null;
		published: boolean;
		created_at: string;
		answered_at?: string | null;
		asker_username?: string;
		profiles?: Profile;
	}

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
			.select("*")
			.eq("to_user_id", user.value.id)
			.order("created_at", { ascending: false });
		if (!error) {
			questionsStore.inboxQuestions = (data as Question[]) || [];
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
					if (payload.eventType === "INSERT") {
						const exists =
							payload.new &&
							questionsStore.inboxQuestions.some(
								(q: Question) => q.id === payload.new!.id
							);
						if (!exists) {
							const q: Question = { ...payload.new };
							questionsStore.inboxQuestions.unshift(q);
						}
					} else if (payload.eventType === "UPDATE") {
						const idx = payload.new
							? questionsStore.inboxQuestions.findIndex(
									(q: Question) => q.id === payload.new!.id
								)
							: -1;
						if (idx !== -1) {
							if (
								payload.new &&
								payload.new.id &&
								payload.new.to_user_id &&
								payload.new.from_user_id &&
								payload.new.question &&
								typeof payload.new.is_anonymous === "boolean" &&
								typeof payload.new.published === "boolean" &&
								payload.new.created_at
							) {
								questionsStore.inboxQuestions[idx] = {
									id: payload.new.id,
									to_user_id: payload.new.to_user_id,
									from_user_id: payload.new.from_user_id,
									question: payload.new.question,
									is_anonymous: payload.new.is_anonymous,
									answer: payload.new.answer ?? null,
									published: payload.new.published,
									created_at: payload.new.created_at,
									answered_at:
										payload.new.answered_at ?? null,
									asker_username: payload.new.asker_username,
									profiles: payload.new.profiles,
								};
							}
						}
					} else if (payload.eventType === "DELETE") {
						if (payload.old && payload.old.id) {
							questionsStore.inboxQuestions =
								questionsStore.inboxQuestions.filter(
									(q: Question) => q.id !== payload.old!.id
								);
						}
					}
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
