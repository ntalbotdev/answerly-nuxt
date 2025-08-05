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
			return state.inboxQuestions.some((q) => !q.answer);
		},
		newInboxCount(state) {
			return state.inboxQuestions.filter((q) => !q.answer).length;
		},
	},
	actions: {
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
	},
});
