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
			const questionsWithAskerUsername = (data || []).map(
				(q: Question & { profiles?: { username?: string } }) => ({
					...q,
					asker_username: q.is_anonymous
						? "Anonymous"
						: q.profiles?.username || "Unknown",
				})
			);
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
			.channel(`inbox-questions-${user.value.id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "questions",
					filter: `to_user_id=eq.${user.value.id}`,
				},
				(payload) => {
					let arr = [...questionsStore.inboxQuestions];

					switch (payload.eventType) {
						case "INSERT":
							if (
								payload.new &&
								!arr.some((q) => q.id === payload.new!.id)
							) {
								const newQuestion = {
									...payload.new,
									answer: payload.new.answer || null, // Ensure it's null, not undefined
									asker_username: payload.new.is_anonymous
										? "Anonymous"
										: "Unknown",
								} as Question & { asker_username: string };

								arr.unshift(newQuestion);

								if (
									!payload.new.is_anonymous &&
									payload.new.from_user_id
								) {
									const fetchUsername = async () => {
										try {
											const { data: profile } =
												await supabase
													.from("profiles")
													.select("username")
													.eq(
														"user_id",
														payload.new!
															.from_user_id
													)
													.single<{
														username: string;
													}>();

											if (profile && profile.username) {
												const questionIndex =
													questionsStore.inboxQuestions.findIndex(
														(q) =>
															q.id ===
															newQuestion.id
													);
												if (questionIndex !== -1) {
													questionsStore.inboxQuestions[
														questionIndex
													] = {
														...questionsStore
															.inboxQuestions[
															questionIndex
														],
														asker_username:
															profile.username,
													} as Question & {
														asker_username: string;
													};
												}
											}
										} catch (error) {
											console.error(
												"[Inbox] Failed to fetch username:",
												error
											);
											// Update with fallback
											const questionIndex =
												questionsStore.inboxQuestions.findIndex(
													(q) =>
														q.id === newQuestion.id
												);
											if (questionIndex !== -1) {
												questionsStore.inboxQuestions[
													questionIndex
												] = {
													...questionsStore
														.inboxQuestions[
														questionIndex
													],
													asker_username: "Unknown",
												} as Question & {
													asker_username: string;
												};
											}
										}
									};

									fetchUsername();
								}
							}
							break;
						case "UPDATE":
							if (payload.new && payload.new.id) {
								const idx = arr.findIndex(
									(q) => q.id === payload.new!.id
								);
								if (idx !== -1) {
									arr[idx] = {
										...arr[idx],
										...payload.new,
									} as Question & { asker_username: string };
								}
							}
							break;
						case "DELETE":
							if (payload.old && payload.old.id) {
								arr = arr.filter(
									(q) => q.id !== payload.old!.id
								);
							}
							break;
					}

					const filteredQuestions = arr.filter(
						(q) => q.answer === null || q.answer === undefined
					);

					// Use a more reactive approach to update the store
					questionsStore.inboxQuestions = [...filteredQuestions];
				}
			)
			.subscribe();
	}

	function unsubscribeInboxQuestions() {
		if (inboxChannel) {
			inboxChannel.unsubscribe();
			inboxChannel = null;
		}
	}

	return {
		fetchInboxQuestions,
		subscribeToInboxQuestions,
		unsubscribeInboxQuestions,
	};
}
