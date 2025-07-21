<script setup lang="ts">
const questionsStore = useQuestionsStore();
const questions = ref<
	(Question & { _answer: string; _saving: boolean; _showForm: boolean })[]
>([]);
const loading = ref(true);
const showRemoveModal = ref(false);
const questionToRemove = ref<
	| (Question & { _answer: string; _saving: boolean; _showForm: boolean })
	| null
>(null);

definePageMeta({
	middleware: "auth",
});

async function fetchMyQuestions() {
	loading.value = true;
	const res = await questionsStore.fetchIncomingQuestions();
	questions.value = res.map((q) => ({
		...q,
		_answer: "",
		_saving: false,
		_showForm: false,
	}));
	loading.value = false;
}
onMounted(fetchMyQuestions);

async function answerQuestion(
	q: Question & { _answer: string; _saving: boolean; _showForm: boolean },
) {
	q._saving = true;
	await questionsStore.answerQuestion(q.id, q._answer);
	q.answer = q._answer;
	q._saving = false;
	q._showForm = false;
	// Remove from inboxQuestions in store so notification count updates
	questionsStore.inboxQuestions = questionsStore.inboxQuestions.filter(
		(qq) => qq.id !== q.id,
	);
}

function openRemoveModal(
	q: Question & { _answer: string; _saving: boolean; _showForm: boolean },
) {
	questionToRemove.value = q;
	showRemoveModal.value = true;
}

function closeRemoveModal() {
	showRemoveModal.value = false;
	questionToRemove.value = null;
}

async function confirmRemoveQuestion() {
	if (questionToRemove.value) {
		await questionsStore.deleteQuestion(questionToRemove.value.id);
		questions.value = questions.value.filter(
			(q) => q.id !== questionToRemove.value!.id,
		);
		questionsStore.inboxQuestions = questionsStore.inboxQuestions.filter(
			(q) => q.id !== questionToRemove.value!.id,
		);
		closeRemoveModal();
	}
}

useHead({
	title: "Inbox",
	meta: [
		{ name: "description", content: "View and respond to your questions." },
	],
});
</script>

<template>
	<div class="inbox">
		<h2 class="inbox__title">Inbox</h2>
		<AppModal v-model:open="showRemoveModal" title="Remove">
			<template #default>
				<div class="inbox__modal-text">
					Are you sure you want to remove this question from
					<strong>{{ questionToRemove?.asker_username }}</strong>?
				</div>

				<div class="inbox__modal-question">
					"{{ questionToRemove?.question }}"
				</div>
				<div class="mt-4 flex justify-end gap-2">
					<button
						class="btn btn--secondary"
						@click="closeRemoveModal"
					>
						Cancel
					</button>
					<button
						class="btn btn--danger"
						@click="confirmRemoveQuestion"
					>
						Remove
					</button>
				</div>
			</template>
		</AppModal>

		<div v-if="loading" class="loading-text">Loading...</div>

		<div v-else class="inbox__questions">
			<div v-if="questions.length === 0" class="inbox__no-questions">
				No questions to answer.
			</div>

			<div v-for="q in questions" :key="q.id" class="inbox__question">
				<div class="inbox__question-header">
					<div class="inbox__question-text">{{ q.question }}</div>

					<div class="inbox__question-metadata">
						<div class="inbox__question-asker-wrapper">
							From:
							<span
								v-if="q.is_anonymous"
								class="inbox__question-asker inbox__question-asker--anonymous"
							>
								Anonymous
							</span>

							<template v-else-if="q.asker_username">
								<NuxtLink
									:to="
										ROUTES.PROFILE_USER(
											q.asker_username ?? '',
										)
									"
									class="inbox__question-asker inbox__question-asker--username"
								>
									{{ q.asker_username }}
								</NuxtLink>
							</template>

							<template v-else>Unknown User</template>
						</div>

						<span class="inbox__question-date">
							{{ formatDateNoSeconds(q.created_at) }}
						</span>
					</div>
				</div>

				<div v-if="!q.answer" class="inbox__question-form-wrapper">
					<div class="inbox__question-form-buttons">
						<button
							v-if="!q._showForm"
							type="button"
							class="btn btn--danger"
							@click="openRemoveModal(q)"
						>
							Remove
						</button>

						<button
							v-if="!q._showForm"
							class="btn btn--primary"
							@click="q._showForm = true"
						>
							Respond
						</button>
					</div>

					<template v-if="q._showForm">
						<form
							class="inbox__question-form"
							@submit.prevent="answerQuestion(q)"
						>
							<textarea
								v-model="q._answer"
								name="answer"
								class="inbox__question-form-input"
								placeholder="Type your answer..."
								rows="3"
							/>

							<div class="inbox__question-form-buttons">
								<button
									type="button"
									class="btn btn--secondary"
									@click="
										q._showForm = false;
										q._answer = '';
									"
								>
									Cancel
								</button>

								<button
									type="submit"
									class="btn btn--primary"
									:disabled="q._saving || !q._answer"
								>
									Answer & Publish
								</button>
							</div>
						</form>
					</template>
				</div>

				<div v-else class="inbox__question-answer">
					<span class="inbox__question-answer-label">Answered:</span>
					<span class="inbox__question-answer-text">{{
						q.answer
					}}</span>
				</div>
			</div>
		</div>
	</div>
</template>
