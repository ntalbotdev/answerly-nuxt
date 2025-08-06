import { defineStore } from "pinia";

export interface Question {
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

export interface QuestionInput {
	to_user_id: string;
	from_user_id: string;
	question: string;
	is_anonymous: boolean;
}

export const useQuestionsStore = defineStore("questions", {
	state: () => ({
		loading: false as boolean,
		error: null as string | null,
		inboxQuestions: [] as Question[],
	}),
	getters: {
		hasNewInboxItems(state) {
			if (!state.inboxQuestions || state.inboxQuestions.length === 0)
				return false;
			return state.inboxQuestions.some((q) => !q.answer);
		},
		newInboxCount(state) {
			if (!state.inboxQuestions || state.inboxQuestions.length === 0)
				return 0;
			return state.inboxQuestions.filter((q) => !q.answer).length;
		},
	},
	actions: {
		async createQuestion(payload: QuestionInput) {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const user = useSupabaseUser();
				const questionId = crypto.randomUUID();
				const { error } = await supabase.from("questions").insert([
					{
						id: questionId,
						...payload,
						answer: null,
						published: false,
						created_at: new Date().toISOString(),
					},
				]);
				if (error) throw error;

				const config = useRuntimeConfig();
				const supabaseUrl = config.public.supabaseUrl;
				const supabaseAnonKey = config.public.supabaseKey;
				const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification`;
				await fetch(edgeFunctionUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${supabaseAnonKey}`,
					},
					body: JSON.stringify({
						user_id: payload.to_user_id,
						type: "question",
						payload: {
							question_id: questionId,
							from_user_id: payload.from_user_id,
							from_username:
								user.value?.user_metadata?.username ||
								"Someone",
						},
					}),
				});
			} catch (err: unknown) {
				if (err instanceof Error) {
					this.error = err.message || "Failed to create question";
				} else {
					this.error = "Failed to create question";
				}
			} finally {
				this.loading = false;
			}
		},

		async answerQuestion(questionId: string, answer: string) {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const user = useSupabaseUser();
				const { data: questionData, error: fetchError } = await supabase
					.from("questions")
					.select("from_user_id, to_user_id")
					.eq("id", questionId)
					.single<{ from_user_id: string; to_user_id: string }>();
				if (fetchError || !questionData)
					throw fetchError || new Error("Question not found");
				const { error } = await supabase
					.from("questions")
					.update({
						answer,
						published: true,
						answered_at: new Date().toISOString(),
					} as any)
					.eq("id", questionId);
				if (error) throw error;

				// Remove the question notification since it's been answered
				const notifStore = useNotificationsStore();
				await notifStore.markNotificationAsRead(questionId);
				// Send notification to asker
				const config = useRuntimeConfig();
				const supabaseUrl = config.public.supabaseUrl;
				const supabaseAnonKey = config.public.supabaseKey;
				const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification`;
				await fetch(edgeFunctionUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${supabaseAnonKey}`,
					},
					body: JSON.stringify({
						user_id: questionData.from_user_id,
						type: "answer",
						payload: {
							question_id: questionId,
							to_user_id: questionData.to_user_id,
							to_username:
								user.value?.user_metadata?.username ||
								"Someone",
						},
					}),
				});
			} catch (err: unknown) {
				if (err instanceof Error) {
					this.error = err.message || "Failed to answer question";
				} else {
					this.error = "Failed to answer question";
				}
			} finally {
				this.loading = false;
			}
		},

		async deleteQuestion(questionId: string) {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const { error } = await supabase
					.from("questions")
					.delete()
					.eq("id", questionId);
				if (error) throw error;

				// Remove the related notification
				const notifStore = useNotificationsStore();
				await notifStore.markNotificationAsRead(questionId);
			} catch (err: unknown) {
				if (err instanceof Error) {
					this.error = err.message || "Failed to delete question";
				} else {
					this.error = "Failed to delete question";
				}
			} finally {
				this.loading = false;
			}
		},
	},
});
