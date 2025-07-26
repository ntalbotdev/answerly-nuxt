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
			// True if there are any unanswered questions in inboxQuestions
			return state.inboxQuestions.some(q => !q.answer);
		},
		newInboxCount(state) {
			return state.inboxQuestions.filter(q => !q.answer).length;
		}
	},
	actions: {
		// Fetch questions the current user has asked
		async fetchAskedQuestions(): Promise<
			(Question & { to_username?: string })[]
		> {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const user = useSupabaseUser();
				if (!user.value) throw new Error("Not logged in");
				const { data, error } = await supabase
					.from("questions")
					.select(
						"id, to_user_id, question, answer, published, created_at, profiles:to_user_id(username)",
					)
					.eq("from_user_id", user.value.id)
					.order("created_at", { ascending: false });
				if (error) throw error;
				return (data || []).map((q: any) => ({
					...q,
					to_username: q.profiles?.username || undefined,
				}));
			} catch (err: any) {
				this.error = err.message || "Failed to fetch asked questions";
				return [];
			} finally {
				this.loading = false;
			}
		},
		async createQuestion(payload: QuestionInput) {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const { error } = await supabase.from("questions").insert([
					{
						id: crypto.randomUUID(),
						...payload,
						answer: null,
						published: false,
					},
				]);
				if (error) throw error;
			} catch (err: any) {
				this.error = err.message || "Failed to create question";
			} finally {
				this.loading = false;
			}
		},

		// Fetch incoming questions for the current user (not yet answered/published)
		async fetchIncomingQuestions(): Promise<Question[]> {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const user = useSupabaseUser();
				if (!user.value) throw new Error("Not logged in");
				const { data, error } = await supabase
					.from("questions")
					.select(
						"id, from_user_id, question, is_anonymous, answer, published, created_at, profiles:from_user_id(username)",
					)
					.eq("to_user_id", user.value.id)
					.eq("published", false)
					.order("created_at", { ascending: false });
				if (error) throw error;
				// Map username for display
				const questions = (data || []).map((q: any) => ({
					...q,
					asker_username: q.is_anonymous
						? undefined
						: q.profiles?.username || "Unknown",
				}));
				this.inboxQuestions = questions;
				return questions;
			} catch (err: any) {
				this.error = err.message || "Failed to fetch questions";
				this.inboxQuestions = [];
				return [];
			} finally {
				this.loading = false;
			}
		},

		// Answer a question and publish it
		async answerQuestion(questionId: string, answer: string) {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const { error } = await supabase
					.from("questions")
					.update({
						answer,
						published: true,
						answered_at: new Date().toISOString(),
					})
					.eq("id", questionId);
				if (error) throw error;
			} catch (err: any) {
				this.error = err.message || "Failed to answer question";
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
			} catch (err: any) {
				this.error = err.message || "Failed to delete question";
			} finally {
				this.loading = false;
			}
		},

		async fetchAnsweredQuestionsForUser(userId: string) {
			this.loading = true;
			this.error = null;
			try {
				const supabase = useSupabaseClient();
				const { data, error } = await supabase
					.from('questions')
					.select('id, question, answer, is_anonymous, created_at, answered_at, profiles:from_user_id(avatar_url, display_name, username)')
					.eq('to_user_id', userId)
					.eq('published', true)
					.order('answered_at', { ascending: false });
				if (error) throw error;
				return data || [];
			} catch (err: any) {
				this.error = err.message || 'Failed to fetch answered questions.';
				return [];
			} finally {
				this.loading = false;
			}
		},
	},
});
